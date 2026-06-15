const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/auth');
const { requireRole, requireProjectMember, requireProjectRole } = require('../middleware/checkRole');

// All routes require authentication
router.use(protect);

// GET /api/projects — returns only projects the user is a member of (Admin sees all)
router.get('/', async (req, res) => {
  const Project = require('../models/Project');
  try {
    const query = req.user.systemRole === 'admin'
      ? {}
      : { 'members.user': req.user._id };
    const projects = await Project.find(query).populate('members.user', 'name email avatar title');
    res.json({ success: true, projects });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/projects — Admin or PM only
router.post('/', requireRole('admin', 'project_manager'), async (req, res) => {
  const Project = require('../models/Project');
  try {
    const project = await Project.create({ ...req.body, createdBy: req.user._id,
      members: [{ user: req.user._id, projectRole: 'project_manager' }] });
    res.status(201).json({ success: true, project });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/projects/:id — any project member
router.get('/:id', requireProjectMember, (req, res) => {
  res.json({ success: true, project: req.project });
});

// PUT /api/projects/:id — PM or Admin
router.put('/:id', requireProjectRole('project_manager'), async (req, res) => {
  const Project = require('../models/Project');
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, project });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/projects/:id/members — PM, TL or Admin can add members
router.post('/:id/members', requireProjectRole('project_manager', 'team_lead'), async (req, res) => {
  const Project = require('../models/Project');
  try {
    const { userId, projectRole } = req.body;
    const project = await Project.findById(req.params.id);
    project.members.push({ user: userId, projectRole: projectRole || 'member' });
    await project.save();
    res.json({ success: true, project });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/projects/:id — Admin or PM
router.delete('/:id', requireRole('admin', 'project_manager'), async (req, res) => {
  const Project = require('../models/Project');
  try {
    await Project.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

const express = require('express');
const router  = express.Router();
const Project = require('../models/Project');
const { protect } = require('../middleware/auth');
const { requireRole, requireProjectMember, requireProjectRole } = require('../middleware/checkRole');

router.use(protect);

/* ── GET /api/projects ───────────────────────────────────────────────────────
 * Admin sees all org projects; others see only projects they're a member of. */
router.get('/', async (req, res) => {
  try {
    const query = req.user.systemRole === 'admin'
      ? { organizationId: req.user.organizationId }
      : { organizationId: req.user.organizationId, 'members.user': req.user._id };

    const projects = await Project.find(query)
      .populate('members.user', 'name email avatar title');
    res.json({ success: true, projects });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ── POST /api/projects — Admin or PM ────────────────────────────────────── */
router.post('/', requireRole('project_manager'), async (req, res) => {
  try {
    const project = await Project.create({
      ...req.body,
      createdBy:      req.user._id,
      organizationId: req.user.organizationId,
      members: [{ user: req.user._id, projectRole: 'project_manager' }],
    });
    res.status(201).json({ success: true, project });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ── GET /api/projects/:id — any project member ──────────────────────────── */
router.get('/:id', requireProjectMember, (req, res) => {
  res.json({ success: true, project: req.project });
});

/* ── PUT /api/projects/:id — PM or Admin ─────────────────────────────────── */
router.put('/:id', requireProjectRole('project_manager'), async (req, res) => {
  try {
    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, organizationId: req.user.organizationId },
      req.body,
      { new: true }
    );
    res.json({ success: true, project });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ── DELETE /api/projects/:id — Admin or PM ──────────────────────────────── */
router.delete('/:id', requireProjectRole('project_manager'), async (req, res) => {
  try {
    await Project.findOneAndDelete({
      _id:            req.params.id,
      organizationId: req.user.organizationId,
    });
    res.json({ success: true, message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ── POST /api/projects/:id/members — PM or Admin ────────────────────────── */
router.post('/:id/members', requireProjectRole('project_manager'), async (req, res) => {
  try {
    const { userId, projectRole } = req.body;
    const project = await Project.findOne({
      _id:            req.params.id,
      organizationId: req.user.organizationId,
    });
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    const alreadyMember = project.members.some(m => m.user.toString() === userId);
    if (alreadyMember) {
      return res.status(400).json({ success: false, message: 'User is already a member of this project' });
    }

    project.members.push({ user: userId, projectRole: projectRole || 'member' });
    await project.save();

    const populated = await Project.findById(project._id)
      .populate('members.user', 'name email avatar title');
    res.json({ success: true, project: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ── DELETE /api/projects/:id/members/:userId — PM or Admin ─────────────── */
router.delete('/:id/members/:userId', requireProjectRole('project_manager'), async (req, res) => {
  try {
    const project = await Project.findOne({
      _id:            req.params.id,
      organizationId: req.user.organizationId,
    });
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    project.members = project.members.filter(
      m => m.user.toString() !== req.params.userId
    );
    await project.save();

    const populated = await Project.findById(project._id)
      .populate('members.user', 'name email avatar title');
    res.json({ success: true, project: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ── Mount task sub-router ───────────────────────────────────────────────── */
router.use('/:id/tasks', require('./taskRoutes'));

module.exports = router;

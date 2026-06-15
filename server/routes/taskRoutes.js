const express = require('express');
const router  = express.Router({ mergeParams: true });
const { protect } = require('../middleware/auth');
const { requireProjectMember, requireProjectRole } = require('../middleware/checkRole');
const Task = require('../models/Task');

router.use(protect);

// GET /api/projects/:id/tasks — all project members can view
router.get('/', requireProjectMember, async (req, res) => {
  try {
    const tasks = await Task.find({ project: req.params.id })
      .populate('assignedTo', 'name avatar')
      .populate('createdBy', 'name avatar');
    res.json({ success: true, tasks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/projects/:id/tasks — PM, TL, Admin only
router.post('/', requireProjectRole('project_manager', 'team_lead'), async (req, res) => {
  try {
    const task = await Task.create({ ...req.body, project: req.params.id, createdBy: req.user._id });
    res.status(201).json({ success: true, task });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/projects/:id/tasks/:taskId — PM/TL can edit any; Member can only edit their own
router.put('/:taskId', requireProjectMember, async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    const isMember = req.projectRole === 'member';
    const isAssigned = task.assignedTo?.toString() === req.user._id.toString();

    // Members can only update their own assigned tasks
    if (isMember && !isAssigned) {
      return res.status(403).json({ success: false, message: 'Members can only update their own tasks' });
    }

    // Clients cannot update anything
    if (req.projectRole === 'client') {
      return res.status(403).json({ success: false, message: 'Clients have read-only access' });
    }

    const updated = await Task.findByIdAndUpdate(req.params.taskId, req.body, { new: true });
    res.json({ success: true, task: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/projects/:id/tasks/:taskId/comments
router.post('/:taskId/comments', requireProjectMember, async (req, res) => {
  try {
    if (req.projectRole === 'client') {
      return res.status(403).json({ success: false, message: 'Clients cannot add comments' });
    }
    const task = await Task.findById(req.params.taskId);
    task.comments.push({ author: req.user._id, text: req.body.text });
    await task.save();
    res.json({ success: true, task });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/projects/:id/tasks/:taskId — PM, TL, Admin
router.delete('/:taskId', requireProjectRole('project_manager', 'team_lead'), async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.taskId);
    res.json({ success: true, message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

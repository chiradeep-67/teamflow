const express = require('express');
const router  = express.Router({ mergeParams: true });
const { protect } = require('../middleware/auth');
const { requireProjectMember, requireProjectRole } = require('../middleware/checkRole');
const Task = require('../models/Task');

router.use(protect);

/* ── GET /api/projects/:id/tasks ─────────────────────────────────────────── */
router.get('/', requireProjectMember, async (req, res) => {
  try {
    const tasks = await Task.find({
      project:        req.params.id,
      organizationId: req.user.organizationId,
    })
      .populate('assignedTo', 'name avatar')
      .populate('createdBy',  'name avatar');
    res.json({ success: true, tasks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ── POST /api/projects/:id/tasks — PM or TL ─────────────────────────────── */
router.post('/', requireProjectRole('project_manager', 'team_lead'), async (req, res) => {
  try {
    const orgId = req.project?.organizationId || req.user.organizationId;
    const body = { ...req.body };
    if (!body.assignedTo) delete body.assignedTo;
    const task = await Task.create({
      ...body,
      project:        req.params.id,
      organizationId: orgId,
      createdBy:      req.user._id,
    });
    res.status(201).json({ success: true, task });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ── PUT /api/projects/:id/tasks/:taskId ────────────────────────────────────
 * PM / TL can edit any task.  Member can only edit their own assigned task. */
router.put('/:taskId', requireProjectMember, async (req, res) => {
  try {
    const orgId = req.project?.organizationId || req.user.organizationId;
    const task = await Task.findOne({
      _id:            req.params.taskId,
      organizationId: orgId,
    });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    if (req.projectRole === 'member') {
      const isAssigned = task.assignedTo?.toString() === req.user._id.toString();
      if (!isAssigned) {
        return res.status(403).json({ success: false, message: 'Members can only update their own tasks' });
      }
    }

    const updateBody = { ...req.body };
    if (!updateBody.assignedTo) delete updateBody.assignedTo;
    const updated = await Task.findByIdAndUpdate(req.params.taskId, updateBody, { new: true });
    res.json({ success: true, task: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ── POST /api/projects/:id/tasks/:taskId/comments ───────────────────────── */
router.post('/:taskId/comments', requireProjectMember, async (req, res) => {
  try {
    const task = await Task.findOne({
      _id:            req.params.taskId,
      organizationId: req.user.organizationId,
    });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    task.comments.push({ author: req.user._id, text: req.body.text });
    await task.save();
    res.json({ success: true, task });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ── DELETE /api/projects/:id/tasks/:taskId — PM or TL ───────────────────── */
router.delete('/:taskId', requireProjectRole('project_manager', 'team_lead'), async (req, res) => {
  try {
    await Task.findOneAndDelete({
      _id:            req.params.taskId,
      organizationId: req.user.organizationId,
    });
    res.json({ success: true, message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

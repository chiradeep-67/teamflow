const express      = require('express');
const router       = express.Router({ mergeParams: true });
const { protect }  = require('../middleware/auth');
const { requireProjectMember, requireProjectRole } = require('../middleware/checkRole');
const Task         = require('../models/Task');
const Project      = require('../models/Project');
const Notification = require('../models/Notification');

router.use(protect);

/* ── GET /api/projects/:id/tasks ─────────────────────────────────────────── */
router.get('/', requireProjectMember, async (req, res) => {
  try {
    const tasks = await Task.find({
      project:        req.params.id,
      organizationId: req.user.organizationId,
    })
      .populate('assignedTo', 'name avatar')
      .populate('createdBy',  'name avatar')
      .populate('comments.author', 'name avatar');
    res.json({ success: true, tasks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ── GET /api/projects/:id/tasks/:taskId — single task ───────────────────── */
router.get('/:taskId', requireProjectMember, async (req, res) => {
  try {
    const task = await Task.findOne({
      _id:            req.params.taskId,
      project:        req.params.id,
      organizationId: req.user.organizationId,
    })
      .populate('assignedTo', 'name avatar email')
      .populate('createdBy',  'name avatar email')
      .populate('comments.author', 'name avatar');
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, task });
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

    // Notify the assignee when a task is created with an assignment
    if (task.assignedTo && task.assignedTo.toString() !== req.user._id.toString()) {
      try {
        const taskLink = `/projects/${req.params.id}/tasks/${task._id}`;
        await Notification.create({
          recipient:      task.assignedTo,
          organizationId: orgId,
          message:        `📋 "${task.title}" was assigned to you by ${req.user.name}`,
          link:           taskLink,
        });
      } catch (_) { /* notification failure must not break task creation */ }
    }

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

    const prevStatus = task.status;

    const ALLOWED = ['title', 'description', 'status', 'priority', 'tags', 'assignedTo', 'dueDate', 'estimatedTime'];
    const updateBody = {};
    for (const key of ALLOWED) {
      if (key in req.body) updateBody[key] = req.body[key];
    }
    if (!updateBody.assignedTo) delete updateBody.assignedTo;
    const updated = await Task.findByIdAndUpdate(req.params.taskId, updateBody, { new: true });

    const taskLink = `/projects/${req.params.id}/tasks/${updated._id}`;

    // Notify the new assignee when task assignment changes
    if (
      updateBody.assignedTo &&
      updateBody.assignedTo.toString() !== req.user._id.toString() &&
      updateBody.assignedTo.toString() !== (task.assignedTo?.toString() ?? '')
    ) {
      try {
        await Notification.create({
          recipient:      updateBody.assignedTo,
          organizationId: req.user.organizationId,
          message:        `📋 "${updated.title}" was assigned to you by ${req.user.name}`,
          link:           taskLink,
        });
      } catch (_) { /* silent */ }
    }

    // Notify team leads + task creator when a task is marked done (and wasn't already done)
    if (updateBody.status === 'done' && prevStatus !== 'done') {
      try {
        const project = await Project.findById(req.params.id);
        if (project) {
          const teamLeadIds = project.members
            .filter(m => m.projectRole === 'team_lead')
            .map(m => m.user.toString());

          const recipientSet = new Set(teamLeadIds);
          // Also notify the task creator if different from the person marking it done
          if (task.createdBy && task.createdBy.toString() !== req.user._id.toString()) {
            recipientSet.add(task.createdBy.toString());
          }

          if (recipientSet.size > 0) {
            const message = `✅ "${updated.title}" was marked as done by ${req.user.name}`;
            const notifications = [...recipientSet].map(recipientId => ({
              recipient:      recipientId,
              organizationId: req.user.organizationId,
              message,
              link:           taskLink,
            }));
            await Notification.insertMany(notifications);
          }
        }
      } catch (_) { /* notification failure must not break the task update response */ }
    }

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
    await task.populate('comments.author', 'name avatar');

    // Notify task assignee and creator (excluding the commenter)
    try {
      const taskLink = `/projects/${req.params.id}/tasks/${task._id}`;
      const commentMessage = `💬 ${req.user.name} commented on "${task.title}"`;
      const notifySet = new Set();
      if (task.assignedTo && task.assignedTo.toString() !== req.user._id.toString()) {
        notifySet.add(task.assignedTo.toString());
      }
      if (task.createdBy && task.createdBy.toString() !== req.user._id.toString()) {
        notifySet.add(task.createdBy.toString());
      }
      if (notifySet.size > 0) {
        const notifications = [...notifySet].map(recipientId => ({
          recipient:      recipientId,
          organizationId: req.user.organizationId,
          message:        commentMessage,
          link:           taskLink,
        }));
        await Notification.insertMany(notifications);
      }
    } catch (_) { /* notification failure must not break comment creation */ }

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

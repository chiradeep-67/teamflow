const express = require('express');
const router  = express.Router();
const { protect }     = require('../middleware/auth');
const { requireRole } = require('../middleware/checkRole');
const Project = require('../models/Project');
const Task    = require('../models/Task');

const MAX_TASKS = 2000;

router.use(protect);
signal: AbortSignal.timeout(240000)
router.post('/analyze-report', requireRole('project_manager', 'team_lead'), async (req, res) => {
  try {
    const question = typeof req.body.question === 'string' ? req.body.question.trim() : '';
    if (!question || question.length > 500) {
      return res.status(400).json({ success: false, message: 'Question must be 1 to 500 characters' });
    }
    const rawHistory = Array.isArray(req.body.history) ? req.body.history : [];
    const history = rawHistory
    .slice(-10)
    .filter(t => t && ['user', 'model'].includes(t.role) && typeof t.text === 'string')
    .map(t => ({ role: t.role, text: t.text.slice(0, 4000) }));

    const projectFilter = { organizationId: req.user.organizationId };
    if (req.user.systemRole !== 'admin') {
      projectFilter['members.user'] = req.user._id;
    }
    const projects = await Project.find(projectFilter).select('name');
    const nameById = new Map(projects.map(p => [p._id.toString(), p.name]));

    const tasks = await Task.find({
      project:        { $in: projects.map(p => p._id) },
      organizationId: req.user.organizationId,
    })
      .populate('assignedTo', 'name')
      .limit(MAX_TASKS)
      .lean();

    if (tasks.length === 0) {
      return res.json({ success: true, answer: 'There are no tasks to analyze yet.' });
    }

    const payload = tasks.map(t => ({
      id:           t._id.toString(),
      title:        t.title,
      project:      nameById.get(t.project.toString()) || 'Unknown project',
      assignee:     t.assignedTo?.name || null,
      status:       t.status,
      priority:     t.priority || 'medium',
      due_date:     t.dueDate ? t.dueDate.toISOString() : null,
      completed_at: t.completedAt ? t.completedAt.toISOString() : null,
    }));

    const aiRes = await fetch(`${process.env.AI_SERVICE_URL}/jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.AI_SERVICE_KEY,
      },
      body: JSON.stringify({ question, history, tasks: payload, user_id: req.user._id.toString() }),
      signal: AbortSignal.timeout(90000),
    });

    if (!aiRes.ok) {
      return res.status(502).json({ success: false, message: 'The AI service could not start the analysis' });
    }

    const data = await aiRes.json();
    res.json({ success: true, jobId: data.job_id });
  } catch (err) {
    console.error('AI route error:', err.message);
    res.status(503).json({ success: false, message: 'AI service unavailable' });
  }
});

router.get('/analyze-report/:jobId', requireRole('project_manager', 'team_lead'), async (req, res) => {
  try {
    if (!/^[a-f0-9]{32}$/.test(req.params.jobId)) {
      return res.status(400).json({ success: false, message: 'Invalid job id' });
    }
    const url = `${process.env.AI_SERVICE_URL}/jobs/${req.params.jobId}?user_id=${encodeURIComponent(req.user._id.toString())}`;
    const aiRes = await fetch(url, {
      headers: { 'x-api-key': process.env.AI_SERVICE_KEY },
      signal: AbortSignal.timeout(90000),
    });
    if (aiRes.status === 404) {
      return res.status(404).json({ success: false, message: 'This analysis expired. Please ask again.' });
    }
    if (!aiRes.ok) {
      return res.status(502).json({ success: false, message: 'The AI service could not answer right now' });
    }
    const data = await aiRes.json();
    res.json({ success: true, status: data.status, answer: data.answer });
  } catch (err) {
    console.error('AI status error:', err.message);
    res.status(503).json({ success: false, message: 'AI service unavailable' });
  }
});

module.exports = router;
const express   = require('express');
const router    = express.Router();
const Workspace = require('../models/Workspace');
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/checkRole');

router.use(protect);

/* ── GET /api/workspace ─────────────────────────────────────────────────────
 * Returns the workspace for the current user's organisation.                  */
router.get('/', async (req, res) => {
  try {
    const workspace = await Workspace.findOne({
      organizationId: req.user.organizationId,
    }).populate('createdBy', 'name email');
    res.json({ success: true, workspace: workspace || null });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ── POST /api/workspace — Admin only ───────────────────────────────────────
 * Should only be needed if seed.js didn't create one.                         */
router.post('/', requireRole('admin'), async (req, res) => {
  try {
    const existing = await Workspace.findOne({ organizationId: req.user.organizationId });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Workspace already exists for this organisation' });
    }
    const workspace = await Workspace.create({
      ...req.body,
      createdBy:      req.user._id,
      organizationId: req.user.organizationId,
    });
    res.status(201).json({ success: true, workspace });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ── PUT /api/workspace — Admin only ─────────────────────────────────────── */
router.put('/', requireRole('admin'), async (req, res) => {
  try {
    const workspace = await Workspace.findOneAndUpdate(
      { organizationId: req.user.organizationId },
      req.body,
      { new: true, upsert: false }
    );
    if (!workspace) return res.status(404).json({ success: false, message: 'No workspace found' });
    res.json({ success: true, workspace });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ── POST /api/workspace/departments — Admin only ────────────────────────── */
router.post('/departments', requireRole('admin'), async (req, res) => {
  try {
    const { name } = req.body;
    const workspace = await Workspace.findOne({ organizationId: req.user.organizationId });
    if (!workspace) return res.status(404).json({ success: false, message: 'No workspace found' });
    if (!workspace.departments.includes(name)) {
      workspace.departments.push(name);
      await workspace.save();
    }
    res.json({ success: true, workspace });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ── DELETE /api/workspace/departments/:name — Admin only ───────────────── */
router.delete('/departments/:name', requireRole('admin'), async (req, res) => {
  try {
    const workspace = await Workspace.findOne({ organizationId: req.user.organizationId });
    if (!workspace) return res.status(404).json({ success: false, message: 'No workspace found' });
    workspace.departments = workspace.departments.filter(d => d !== req.params.name);
    await workspace.save();
    res.json({ success: true, workspace });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

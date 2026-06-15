const express = require('express');
const router  = express.Router();
const crypto  = require('crypto');
const User    = require('../models/User');
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/checkRole');

router.use(protect);

/* ── GET /api/users ──────────────────────────────────────────────────────────
 * Admin sees everyone in the org; PM sees everyone; TL/Member see only themselves. */
router.get('/', async (req, res) => {
  try {
    const canSeeAll = ['admin', 'project_manager'].includes(req.user.systemRole);
    const users = canSeeAll
      ? await User.find({ organizationId: req.user.organizationId, isActive: true }).select('-password')
      : [req.user];
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ── POST /api/users ─────────────────────────────────────────────────────────
 * Admin (or PM for team_lead/member) creates a user directly — no invite email needed.
 * Returns a one-time temp password that the caller must share with the new user. */
router.post('/', requireRole('admin', 'project_manager'), async (req, res) => {
  try {
    const { name, email, phone, systemRole, department, title } = req.body;

    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'name and email are required' });
    }

    // PM can only create team_lead or member accounts
    if (
      req.user.systemRole === 'project_manager' &&
      !['team_lead', 'member'].includes(systemRole)
    ) {
      return res.status(403).json({
        success: false,
        message: 'Project Managers can only create Team Lead or Member accounts',
      });
    }

    if (await User.findOne({ email: email.toLowerCase() })) {
      return res.status(400).json({ success: false, message: 'A user with this email already exists' });
    }

    // Generate a readable temp password: TF-XXXXXXXX
    const tempPassword =
      'TF-' + crypto.randomBytes(4).toString('hex').toUpperCase();

    const user = await User.create({
      name,
      email:              email.toLowerCase(),
      password:           tempPassword,   // pre-save hook hashes it
      phone:              phone      || '',
      systemRole:         systemRole || 'member',
      department:         department || '',
      title:              title      || '',
      organizationId:     req.user.organizationId,
      mustChangePassword: true,
      isActive:           true,
    });

    res.status(201).json({
      success:     true,
      user: {
        id:         user._id,
        name:       user.name,
        email:      user.email,
        systemRole: user.systemRole,
        department: user.department,
        title:      user.title,
        phone:      user.phone,
      },
      // Show the temp password once — admin must share it with the new user
      tempPassword,
      note: 'Share this temporary password with the user. They will be required to change it on first login.',
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ── GET /api/users/:id ──────────────────────────────────────────────────── */
router.get('/:id', async (req, res) => {
  const isSelf  = req.params.id === req.user._id.toString();
  const isAdmin = req.user.systemRole === 'admin';
  if (!isSelf && !isAdmin) {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }
  try {
    const user = await User.findOne({
      _id:            req.params.id,
      organizationId: req.user.organizationId,
    }).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ── PUT /api/users/:id — own profile or admin ───────────────────────────── */
router.put('/:id', async (req, res) => {
  const isSelf  = req.params.id === req.user._id.toString();
  const isAdmin = req.user.systemRole === 'admin';
  if (!isSelf && !isAdmin) {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }
  try {
    // Prevent privilege escalation via this endpoint
    const { password, systemRole, organizationId, mustChangePassword, ...safeBody } = req.body;
    const updated = await User.findOneAndUpdate(
      { _id: req.params.id, organizationId: req.user.organizationId },
      safeBody,
      { new: true }
    ).select('-password');
    if (!updated) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ── PUT /api/users/:id/role — Admin only ────────────────────────────────── */
router.put('/:id/role', requireRole('admin'), async (req, res) => {
  try {
    const allowed = ['project_manager', 'team_lead', 'member'];
    if (!allowed.includes(req.body.systemRole)) {
      return res.status(400).json({ success: false, message: `Role must be one of: ${allowed.join(', ')}` });
    }
    const user = await User.findOneAndUpdate(
      { _id: req.params.id, organizationId: req.user.organizationId },
      { systemRole: req.body.systemRole },
      { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ── DELETE /api/users/:id — Admin soft-deletes (deactivates) ───────────── */
router.delete('/:id', requireRole('admin'), async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot deactivate your own account' });
    }
    const user = await User.findOneAndUpdate(
      { _id: req.params.id, organizationId: req.user.organizationId },
      { isActive: false },
      { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: `${user.name} has been deactivated` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

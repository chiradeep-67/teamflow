const express    = require('express');
const router     = express.Router();
const Invitation = require('../models/Invitation');
const User       = require('../models/User');
const Workspace  = require('../models/Workspace');
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/checkRole');
const { sendInviteEmail } = require('../utils/email');

/* ── POST /api/invites ────────────────────────────────────────────────────────
 * Admin can invite any role.
 * PM can only invite team_lead or member.                                      */
router.post('/', protect, requireRole('admin', 'project_manager'), async (req, res) => {
  try {
    const { email, systemRole, department } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

    // Validate role vs caller's permission level
    if (req.user.systemRole === 'project_manager') {
      if (!['team_lead', 'member'].includes(systemRole)) {
        return res.status(403).json({
          success: false,
          message: 'Project Managers can only invite Team Leads or Members',
        });
      }
    }

    // Check for existing user in same org
    const existing = await User.findOne({
      email:          email.toLowerCase(),
      organizationId: req.user.organizationId,
    });
    if (existing) {
      return res.status(400).json({ success: false, message: 'A user with this email already exists in your organisation' });
    }

    // Invalidate any previous pending invite for same email + org
    await Invitation.deleteMany({
      email:          email.toLowerCase(),
      organizationId: req.user.organizationId,
      accepted:       false,
    });

    const token  = Invitation.generateToken();
    const invite = await Invitation.create({
      email:          email.toLowerCase(),
      systemRole:     systemRole || 'member',
      department:     department || '',
      token,
      invitedBy:      req.user._id,
      organizationId: req.user.organizationId,
    });

    const inviteLink = `${process.env.CLIENT_URL}/register?invite=${token}`;

    // Send invite email (non-blocking)
    const workspace = await Workspace.findOne({ organizationId: req.user.organizationId }).select('name');
    sendInviteEmail({
      to:            email,
      invitedBy:     req.user.name,
      workspaceName: workspace?.name || 'TeamFlow',
      role:          systemRole || 'member',
      inviteLink,
    }).catch(err => console.error('📧 Email send failed:', err.message));

    res.status(201).json({
      success: true,
      invite: {
        id:         invite._id,
        email:      invite.email,
        systemRole: invite.systemRole,
        department: invite.department,
        token:      invite.token,
        inviteLink,
        expiresAt:  invite.expiresAt,
        emailSent:  !!(process.env.EMAIL_USER && process.env.EMAIL_PASS),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ── GET /api/invites — Admin only ────────────────────────────────────────── */
router.get('/', protect, requireRole('admin'), async (req, res) => {
  try {
    const invites = await Invitation.find({
      organizationId: req.user.organizationId,
      accepted:       false,
    })
      .populate('invitedBy', 'name email')
      .sort('-createdAt');
    res.json({ success: true, invites });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ── GET /api/invites/verify/:token — public ──────────────────────────────── */
router.get('/verify/:token', async (req, res) => {
  try {
    const invite = await Invitation.findOne({
      token:    req.params.token,
      accepted: false,
      expiresAt:{ $gt: new Date() },
    }).populate('invitedBy', 'name');

    if (!invite) {
      return res.status(404).json({ success: false, message: 'Invite link is invalid or has expired' });
    }

    const workspace = await Workspace.findOne({ organizationId: invite.organizationId }).select('name');

    res.json({
      success: true,
      invite: {
        email:         invite.email,
        systemRole:    invite.systemRole,
        department:    invite.department,
        invitedBy:     invite.invitedBy?.name || 'your workspace admin',
        workspaceName: workspace?.name || 'TeamFlow',
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ── DELETE /api/invites/:id — Admin only ─────────────────────────────────── */
router.delete('/:id', protect, requireRole('admin'), async (req, res) => {
  try {
    await Invitation.findOneAndDelete({
      _id:            req.params.id,
      organizationId: req.user.organizationId,
    });
    res.json({ success: true, message: 'Invite revoked' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

const jwt        = require('jsonwebtoken');
const User       = require('../models/User');
const Invitation = require('../models/Invitation');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

/* Consistent user payload returned on login / register */
const userPayload = (user) => ({
  id:                 user._id,
  name:               user.name,
  email:              user.email,
  systemRole:         user.systemRole,
  organizationId:     user.organizationId,
  mustChangePassword: user.mustChangePassword,
  avatar:             user.avatar,
  title:              user.title,
  department:         user.department,
  phone:              user.phone,
});

// ─── GET /api/auth/setup ──────────────────────────────────────────────────
// Admin accounts are created via seed.js — there is no public first-user flow.
// Returning needsSetup:false keeps the RegisterPage showing "Invite required"
// for any visitor who has no invite token.
const getSetupStatus = async (_req, res) => {
  res.json({ success: true, needsSetup: false });
};

// ─── POST /api/auth/register ──────────────────────────────────────────────
// Only reachable via a valid invite token.  Admin accounts are seeded, not registered.
const register = async (req, res) => {
  try {
    const { name, email, password, phone, inviteToken } = req.body;

    if (!inviteToken) {
      return res.status(403).json({
        success: false,
        message: 'An invite link is required to join this workspace',
      });
    }

    /* Validate invite — must be unused, unexpired, and email must match */
    const invite = await Invitation.findOne({
      token:    inviteToken,
      accepted: false,
      expiresAt:{ $gt: new Date() },
    });

    if (!invite) {
      return res.status(400).json({ success: false, message: 'Invite link is invalid or has expired' });
    }

    if (invite.email.toLowerCase() !== email.toLowerCase()) {
      return res.status(400).json({ success: false, message: 'Email does not match the invite' });
    }

    if (await User.findOne({ email: email.toLowerCase() })) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const user = await User.create({
      name,
      email,
      password,
      phone:          phone || '',
      systemRole:     invite.systemRole,
      organizationId: invite.organizationId,
      department:     invite.department || '',
    });

    invite.accepted = true;
    await invite.save();

    res.status(201).json({
      success: true,
      token:   generateToken(user._id),
      user:    userPayload(user),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── POST /api/auth/login ─────────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email?.toLowerCase() }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Your account has been deactivated' });
    }

    res.json({
      success: true,
      token:   generateToken(user._id),
      user:    userPayload(user),
      // Front-end should redirect to /change-password when this is true
      mustChangePassword: user.mustChangePassword,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/auth/me ─────────────────────────────────────────────────────
const getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

// ─── POST /api/auth/change-password ──────────────────────────────────────
// Authenticated endpoint.  Used both for forced first-login change and
// voluntary password updates from the Profile page.
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'currentPassword and newPassword are required' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'New password must be at least 8 characters' });
    }

    // Re-fetch with password field
    const user = await User.findById(req.user._id).select('+password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const ok = await user.matchPassword(currentPassword);
    if (!ok) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({ success: false, message: 'New password must differ from the current one' });
    }

    user.password           = newPassword; // pre-save hook will hash it
    user.mustChangePassword = false;
    await user.save();

    // Issue a fresh token and return updated user so the client can re-persist
    res.json({
      success: true,
      message: 'Password changed successfully',
      token:   generateToken(user._id),
      user:    userPayload(user),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { register, login, getMe, getSetupStatus, changePassword };

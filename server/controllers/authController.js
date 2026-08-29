const jwt          = require('jsonwebtoken');
const User         = require('../models/User');
const Invitation   = require('../models/Invitation');
const Organization = require('../models/Organization');
const Workspace    = require('../models/Workspace');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

// Valid team-size buckets an admin can choose at signup
const TEAM_SIZES = ['1-10', '11-50', '51-200', '201-500', '500+'];

const DEFAULT_DEPARTMENTS = [
  'Engineering', 'Design', 'Product', 'Marketing',
  'Sales', 'Finance', 'Operations', 'HR',
];

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
// Legacy endpoint, unused by the client — new admins now self-serve via
// POST /api/auth/create-org, and /register is reserved for invited teammates.
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

    if (invite.email.toLowerCase().trim() !== email.toLowerCase().trim()) {
      return res.status(400).json({ success: false, message: 'Email does not match the invite' });
    }

    if (await User.findOne({ email: email.toLowerCase().trim() })) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase().trim(),
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

// ─── POST /api/auth/create-org ────────────────────────────────────────────
// Public endpoint. Anyone can create a new organisation + admin account.
// The admin picks the workspace name and expected team size up front, so the
// workspace is fully usable the moment the account is created — no separate
// onboarding step required.
// Creates: Organization → Admin User → Workspace, then returns a JWT (auto-login).
const createOrg = async (req, res) => {
  try {
    const { orgName, teamSize, name, email, password, phone } = req.body;

    if (!orgName?.trim())   return res.status(400).json({ success: false, message: 'Workspace name is required' });
    if (!teamSize?.trim())  return res.status(400).json({ success: false, message: 'Team size is required' });
    if (!TEAM_SIZES.includes(teamSize)) {
      return res.status(400).json({ success: false, message: 'Invalid team size' });
    }
    if (!name?.trim())      return res.status(400).json({ success: false, message: 'Your name is required' });
    if (!email?.trim())     return res.status(400).json({ success: false, message: 'Email is required' });
    if (!password)          return res.status(400).json({ success: false, message: 'Password is required' });
    if (password.length < 8) return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });

    // Check email not already taken
    if (await User.findOne({ email: email.toLowerCase() })) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    // 1. Create organisation
    const org = await Organization.create({ name: orgName.trim() });

    // 2. Create admin user
    const admin = await User.create({
      name:           name.trim(),
      email:          email.toLowerCase().trim(),
      password,                          // pre-save hook hashes it
      phone:          phone || '',
      systemRole:     'admin',
      organizationId: org._id,
      isActive:       true,
    });

    // 3. Create workspace — slug from org name, ensure uniqueness
    const base = orgName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    let slug = base;
    let attempt = 1;
    while (await Workspace.findOne({ slug })) {
      slug = `${base}-${attempt++}`;
    }

    await Workspace.create({
      name:           orgName.trim(),
      slug,
      size:           teamSize,
      organizationId: org._id,
      createdBy:      admin._id,
      departments:    DEFAULT_DEPARTMENTS,
    });

    res.status(201).json({
      success: true,
      token:   generateToken(admin._id),
      user:    userPayload(admin),
      message: `Organisation "${orgName}" created successfully`,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { register, login, getMe, getSetupStatus, changePassword, createOrg };
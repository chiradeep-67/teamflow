const Project = require('../models/Project');

/**
 * System-role gate — checks req.user.systemRole.
 * Admin always passes every role gate (top of hierarchy).
 *
 * Usage: router.post('/', protect, requireRole('project_manager'), handler)
 */
const requireRole = (...roles) => (req, res, next) => {
  if (req.user.systemRole === 'admin') return next();
  if (!roles.includes(req.user.systemRole)) {
    return res.status(403).json({
      success: false,
      message: `Access denied — requires role: ${roles.join(' or ')}`,
    });
  }
  next();
};

/**
 * Project-level role gate.
 * Always loads the project and enforces org isolation.
 * Admin bypasses the role check but the project is still loaded and attached.
 *
 * Usage: router.post('/:id/tasks', protect, requireProjectRole('team_lead','project_manager'), handler)
 */
const requireProjectRole = (...roles) => async (req, res, next) => {
  try {
    const project = await Project.findOne({
      _id:            req.params.id || req.params.projectId,
      organizationId: req.user.organizationId,
    }).populate('members.user', 'name email avatar title');

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    req.project = project;

    // Admin always passes — give them full project-manager level access
    if (req.user.systemRole === 'admin') {
      req.projectRole = 'project_manager';
      return next();
    }

    const membership = project.members.find(
      m => (m.user?._id || m.user).toString() === req.user._id.toString()
    );

    if (!membership) {
      return res.status(403).json({ success: false, message: 'You are not a member of this project' });
    }

    if (!roles.includes(membership.projectRole)) {
      return res.status(403).json({
        success: false,
        message: `Project action requires role: ${roles.join(' or ')}`,
      });
    }

    req.projectRole = membership.projectRole;
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * Ensure the current user is a member (any role) of the project.
 * Admin always passes. Project is always loaded and attached to req.project.
 */
const requireProjectMember = async (req, res, next) => {
  try {
    const project = await Project.findOne({
      _id:            req.params.id || req.params.projectId,
      organizationId: req.user.organizationId,
    }).populate('members.user', 'name email avatar title');

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    req.project = project;

    if (req.user.systemRole === 'admin') {
      req.projectRole = 'project_manager';
      return next();
    }

    const membership = project.members.find(
      m => (m.user?._id || m.user).toString() === req.user._id.toString()
    );

    if (!membership) {
      return res.status(403).json({ success: false, message: 'You are not a member of this project' });
    }

    req.projectRole = membership.projectRole;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { requireRole, requireProjectRole, requireProjectMember };

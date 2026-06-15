const Project = require('../models/Project');

/**
 * System-role gate — checks req.user.systemRole.
 * Usage: router.post('/', protect, requireRole('admin','project_manager'), handler)
 */
const requireRole = (...roles) => (req, res, next) => {
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
 * Loads the project and checks if req.user has one of the required PROJECT roles.
 * Admin always passes.
 *
 * Usage: router.post('/:id/tasks', protect, requireProjectRole('team_lead','project_manager'), handler)
 */
const requireProjectRole = (...roles) => async (req, res, next) => {
  if (req.user.systemRole === 'admin') return next();

  try {
    const project = await Project.findById(req.params.id || req.params.projectId);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    const membership = project.members.find(m => m.user.toString() === req.user._id.toString());
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
    req.project     = project;
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * Ensure the current user is a member (any role) of the project.
 * Admins always pass.
 */
const requireProjectMember = async (req, res, next) => {
  if (req.user.systemRole === 'admin') return next();

  try {
    const project = await Project.findById(req.params.id || req.params.projectId);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    const membership = project.members.find(m => m.user.toString() === req.user._id.toString());
    if (!membership) {
      return res.status(403).json({ success: false, message: 'You are not a member of this project' });
    }

    req.projectRole = membership.projectRole;
    req.project     = project;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { requireRole, requireProjectRole, requireProjectMember };

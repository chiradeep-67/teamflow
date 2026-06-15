import { useAuth } from '../context/AuthContext';
import { hasPermission, canInProject, getEffectiveRole, ROLES } from '../utils/permissions';

/**
 * Returns helpers to check the current user's permissions.
 *
 * System-level:  can('CREATE_PROJECT')
 * Project-level: canIn(project, 'CREATE_TASK')
 * Role checks:   isRole('admin'), isAtLeast('team_lead')
 */
export function usePermissions() {
  const { user } = useAuth();

  return {
    /** Check a system-level permission against the user's system role */
    can: (permission) => {
      if (!user) return false;
      return hasPermission(user.systemRole, permission);
    },

    /** Check a permission within a specific project context */
    canIn: (project, permission) => {
      if (!user) return false;
      return canInProject(user, project, permission);
    },

    /** Get the user's effective role inside a project */
    roleIn: (project) => getEffectiveRole(user, project),

    /** True if the user is a member (any role) of the given project */
    isMemberOf: (project) => {
      if (!user) return false;
      if (user.systemRole === ROLES.ADMIN) return true;
      return project?.members?.some(m => m.userId === user.id) ?? false;
    },

    /** True if the user's system role matches */
    isRole: (role) => user?.systemRole === role,

    /** True if user's system role is Admin */
    isAdmin: user?.systemRole === ROLES.ADMIN,

    /** True if user's system role is Admin or PM */
    isPMOrAbove: [ROLES.ADMIN, ROLES.PM].includes(user?.systemRole),

    /** True if user's system role is TL or above */
    isTLOrAbove: [ROLES.ADMIN, ROLES.PM, ROLES.TEAM_LEAD].includes(user?.systemRole),

    /** The raw user object */
    user,
  };
}

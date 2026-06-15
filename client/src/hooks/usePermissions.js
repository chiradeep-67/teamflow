import { useAuth } from '../context/AuthContext';
import { hasPermission, canInProject, getEffectiveRole, ROLES } from '../utils/permissions';

export function usePermissions() {
  const { user } = useAuth();

  return {
    can:    (permission) => !user ? false : hasPermission(user.systemRole, permission),
    canIn:  (project, permission) => !user ? false : canInProject(user, project, permission),
    roleIn: (project) => getEffectiveRole(user, project),

    isMemberOf: (project) => {
      if (!user) return false;
      if (user.systemRole === ROLES.ADMIN) return true;
      return project?.members?.some(
        m => (m.user?._id || m.user) === user.id || m.userId === user.id
      ) ?? false;
    },

    isRole:      (role) => user?.systemRole === role,
    isAdmin:     user?.systemRole === ROLES.ADMIN,
    isPMOrAbove: [ROLES.ADMIN, ROLES.PM].includes(user?.systemRole),
    isTLOrAbove: [ROLES.ADMIN, ROLES.PM, ROLES.TEAM_LEAD].includes(user?.systemRole),
    user,
  };
}

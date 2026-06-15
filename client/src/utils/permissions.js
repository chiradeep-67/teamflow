export const ROLES = {
  ADMIN: 'admin',
  PM: 'project_manager',
  TEAM_LEAD: 'team_lead',
  MEMBER: 'member',
  CLIENT: 'client',
};

export const ROLE_LABELS = {
  admin: 'Admin',
  project_manager: 'Project Manager',
  team_lead: 'Team Lead',
  member: 'Member',
  client: 'Client',
};

export const ROLE_HIERARCHY = {
  admin: 5,
  project_manager: 4,
  team_lead: 3,
  member: 2,
  client: 1,
};

// Color tokens per role
export const ROLE_STYLES = {
  admin: {
    bg: 'bg-red-50 dark:bg-red-500/10',
    text: 'text-red-600 dark:text-red-400',
    border: 'border-red-200 dark:border-red-500/20',
    dot: 'bg-red-500',
  },
  project_manager: {
    bg: 'bg-indigo-50 dark:bg-indigo-500/10',
    text: 'text-indigo-600 dark:text-indigo-400',
    border: 'border-indigo-200 dark:border-indigo-500/20',
    dot: 'bg-indigo-500',
  },
  team_lead: {
    bg: 'bg-violet-50 dark:bg-violet-500/10',
    text: 'text-violet-600 dark:text-violet-400',
    border: 'border-violet-200 dark:border-violet-500/20',
    dot: 'bg-violet-500',
  },
  member: {
    bg: 'bg-teal-50 dark:bg-teal-500/10',
    text: 'text-teal-600 dark:text-teal-400',
    border: 'border-teal-200 dark:border-teal-500/20',
    dot: 'bg-teal-500',
  },
  client: {
    bg: 'bg-gray-100 dark:bg-gray-800',
    text: 'text-gray-500 dark:text-gray-400',
    border: 'border-gray-200 dark:border-gray-700',
    dot: 'bg-gray-400',
  },
};

/**
 * System-level permissions (independent of project context)
 * null in the roles array means the permission check is done at runtime
 */
export const PERMISSIONS = {
  // System-wide
  MANAGE_USERS:        ['admin'],
  VIEW_ALL_PROJECTS:   ['admin'],
  CREATE_PROJECT:      ['admin', 'project_manager'],
  DELETE_PROJECT:      ['admin', 'project_manager'],
  VIEW_REPORTS:        ['admin', 'project_manager', 'team_lead'],
  VIEW_TEAM_PAGE:      ['admin', 'project_manager'],

  // Project-level (checked against project role, not system role)
  MANAGE_PROJECT:      ['admin', 'project_manager'],
  MANAGE_MEMBERS:      ['admin', 'project_manager', 'team_lead'],
  CREATE_TASK:         ['admin', 'project_manager', 'team_lead'],
  ASSIGN_TASK:         ['admin', 'project_manager', 'team_lead'],
  UPDATE_ANY_TASK:     ['admin', 'project_manager', 'team_lead'],
  UPDATE_OWN_TASK:     ['admin', 'project_manager', 'team_lead', 'member'],
  DELETE_TASK:         ['admin', 'project_manager', 'team_lead'],
  ADD_COMMENT:         ['admin', 'project_manager', 'team_lead', 'member'],
  VIEW_PROJECT:        ['admin', 'project_manager', 'team_lead', 'member', 'client'],
};

/**
 * Check if a given role has the specified permission.
 * Use this for system-level checks.
 */
export function hasPermission(role, permission) {
  return PERMISSIONS[permission]?.includes(role) ?? false;
}

/**
 * Given a user and a projectId, return the user's effective role in that project.
 * Admins always get admin-level access.
 * Non-members get null (no access).
 */
export function getEffectiveRole(user, project) {
  if (!user || !project) return null;
  if (user.systemRole === ROLES.ADMIN) return ROLES.ADMIN;

  const membership = project.members?.find(m => m.userId === user.id);
  return membership?.projectRole ?? null;
}

/**
 * Check if a user can perform an action within a specific project context.
 */
export function canInProject(user, project, permission) {
  const role = getEffectiveRole(user, project);
  if (!role) return false;
  return PERMISSIONS[permission]?.includes(role) ?? false;
}

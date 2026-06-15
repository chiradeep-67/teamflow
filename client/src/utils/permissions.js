export const ROLES = {
  ADMIN:    'admin',
  PM:       'project_manager',
  TEAM_LEAD:'team_lead',
  MEMBER:   'member',
};

export const ROLE_LABELS = {
  admin:           'Admin',
  project_manager: 'Project Manager',
  team_lead:       'Team Lead',
  member:          'Member',
};

export const ROLE_HIERARCHY = {
  admin:           4,
  project_manager: 3,
  team_lead:       2,
  member:          1,
};

export const ROLE_STYLES = {
  admin: {
    bg:     'bg-red-50 dark:bg-red-500/10',
    text:   'text-red-600 dark:text-red-400',
    border: 'border-red-200 dark:border-red-500/20',
    dot:    'bg-red-500',
  },
  project_manager: {
    bg:     'bg-indigo-50 dark:bg-indigo-500/10',
    text:   'text-indigo-600 dark:text-indigo-400',
    border: 'border-indigo-200 dark:border-indigo-500/20',
    dot:    'bg-indigo-500',
  },
  team_lead: {
    bg:     'bg-violet-50 dark:bg-violet-500/10',
    text:   'text-violet-600 dark:text-violet-400',
    border: 'border-violet-200 dark:border-violet-500/20',
    dot:    'bg-violet-500',
  },
  member: {
    bg:     'bg-teal-50 dark:bg-teal-500/10',
    text:   'text-teal-600 dark:text-teal-400',
    border: 'border-teal-200 dark:border-teal-500/20',
    dot:    'bg-teal-500',
  },
};

export const PERMISSIONS = {
  // System-wide
  MANAGE_WORKSPACE:  ['admin'],
  MANAGE_USERS:      ['admin'],
  VIEW_ALL_PROJECTS: ['admin'],
  CREATE_PROJECT:    ['admin', 'project_manager'],
  DELETE_PROJECT:    ['admin', 'project_manager'],
  VIEW_REPORTS:      ['admin', 'project_manager', 'team_lead'],
  VIEW_TEAM_PAGE:    ['admin', 'project_manager'],
  INVITE_MEMBERS:    ['admin', 'project_manager'],

  // Project-level (checked against project role)
  MANAGE_PROJECT:   ['project_manager'],
  MANAGE_MEMBERS:   ['project_manager', 'team_lead'],
  CREATE_TASK:      ['project_manager', 'team_lead'],
  ASSIGN_TASK:      ['project_manager', 'team_lead'],
  UPDATE_ANY_TASK:  ['project_manager', 'team_lead'],
  UPDATE_OWN_TASK:  ['project_manager', 'team_lead', 'member'],
  DELETE_TASK:      ['project_manager', 'team_lead'],
  ADD_COMMENT:      ['project_manager', 'team_lead', 'member'],
  VIEW_PROJECT:     ['project_manager', 'team_lead', 'member'],
};

export function hasPermission(role, permission) {
  return PERMISSIONS[permission]?.includes(role) ?? false;
}

export function getEffectiveRole(user, project) {
  if (!user || !project) return null;
  if (user.systemRole === ROLES.ADMIN) return 'project_manager';
  const membership = project.members?.find(
    m => (m.user?._id || m.user) === user.id || m.userId === user.id
  );
  return membership?.projectRole ?? null;
}

export function canInProject(user, project, permission) {
  const role = getEffectiveRole(user, project);
  if (!role) return false;
  return PERMISSIONS[permission]?.includes(role) ?? false;
}

import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../utils/permissions';

/**
 * Renders children only if the current user's system role is in `roles`.
 * Pass `projectRole` and `project` to also gate on project-level role.
 *
 * Usage:
 *   <RoleGate roles={['admin', 'project_manager']}>
 *     <CreateProjectButton />
 *   </RoleGate>
 */
export function RoleGate({ roles, children, fallback = null }) {
  const { user } = useAuth();
  if (!user) return fallback;

  // Admin always passes
  if (user.systemRole === ROLES.ADMIN) return children;

  if (!roles || roles.includes(user.systemRole)) return children;
  return fallback;
}

/**
 * Gate on a user's role within a specific project.
 * Admins always pass through.
 *
 * Usage:
 *   <ProjectRoleGate project={project} roles={['team_lead', 'project_manager']}>
 *     <AddTaskButton />
 *   </ProjectRoleGate>
 */
export function ProjectRoleGate({ project, roles, children, fallback = null }) {
  const { user } = useAuth();
  if (!user) return fallback;
  if (user.systemRole === ROLES.ADMIN) return children;

  const membership = project?.members?.find(m => m.userId === user.id);
  if (!membership) return fallback;
  if (!roles || roles.includes(membership.projectRole)) return children;
  return fallback;
}

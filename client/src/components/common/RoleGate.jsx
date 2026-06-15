import { useAuth } from '../../context/AuthContext';

/**
 * Renders children only if the current user's system role is in `roles`.
 * Admin always passes every gate.
 *
 * <RoleGate roles={['project_manager', 'team_lead']}>…</RoleGate>
 */
export function RoleGate({ roles, children, fallback = null }) {
  const { user } = useAuth();
  if (!user) return fallback;
  if (user.systemRole === 'admin') return children;
  if (!roles || roles.includes(user.systemRole)) return children;
  return fallback;
}

/**
 * Gate on a user's role within a specific project.
 * Admin always passes through.
 *
 * <ProjectRoleGate project={project} roles={['team_lead', 'project_manager']}>…</ProjectRoleGate>
 */
export function ProjectRoleGate({ project, roles, children, fallback = null }) {
  const { user } = useAuth();
  if (!user) return fallback;
  if (user.systemRole === 'admin') return children;

  const membership = project?.members?.find(
    m => (m.user?._id || m.user) === user.id || m.userId === user.id
  );
  if (!membership) return fallback;
  if (!roles || roles.includes(membership.projectRole)) return children;
  return fallback;
}

import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { AppSidebar } from './components/layout/AppSidebar';
import LandingPage         from './pages/LandingPage';
import LoginPage           from './pages/LoginPage';
import RegisterPage        from './pages/RegisterPage';
import ChangePasswordPage  from './pages/ChangePasswordPage';
import CreateOrgPage       from './pages/CreateOrgPage';
import OnboardingPage      from './pages/OnboardingPage';
import DashboardPage       from './pages/DashboardPage';
import ProjectsPage        from './pages/ProjectsPage';
import ProjectDetailPage   from './pages/ProjectDetailPage';
import ProfilePage         from './pages/ProfilePage';
import TeamPage            from './pages/TeamPage';
import EmployeesPage       from './pages/EmployeesPage';
import SettingsPage        from './pages/SettingsPage';
import ReportsPage         from './pages/ReportsPage';
import TaskDetailPage      from './pages/TaskDetailPage';
import { ROUTES }          from './utils/constants';

/* ─── Route guards ─────────────────────────────────────────────────────── */

function ProtectedLayout() {
  const { user, workspaceLoaded } = useAuth();

  if (!workspaceLoaded) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
        <Loader2 size={28} className="animate-spin text-indigo-500" />
      </div>
    );
  }
  if (!user) return <Navigate to={ROUTES.LOGIN} replace />;

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">
      <AppSidebar />
      <main className="flex-1 overflow-y-auto pt-14 lg:pt-0">
        <Outlet />
      </main>
    </div>
  );
}

function PublicRoute({ children }) {
  const { user } = useAuth();
  if (user) return <Navigate to={ROUTES.BOARD} replace />;
  return children;
}

function RequireAuth({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to={ROUTES.LOGIN} replace />;
  return children;
}

function RequireRole({ roles, children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to={ROUTES.LOGIN} replace />;
  if (!roles.includes(user.systemRole)) return <Navigate to={ROUTES.BOARD} replace />;
  return children;
}

function DashboardRoute() {
  const { user } = useAuth();
  if (user?.systemRole === 'member') return <Navigate to={ROUTES.BOARD} replace />;
  return <DashboardPage />;
}

/* ─── 404 page ─────────────────────────────────────────────────────────── */
function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-gray-950 text-center px-6">
      <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center mx-auto mb-5">
        <span className="text-3xl">404</span>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Page not found</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-xs">
        The page you're looking for doesn't exist or the link may have expired.
      </p>
      <a
        href="/"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
      >
        Go home
      </a>
    </div>
  );
}

/* ─── App ──────────────────────────────────────────────────────────────── */
export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <div className="min-h-screen text-gray-900 dark:text-white transition-colors duration-300">
              <Routes>
                {/* Public */}
                <Route path={ROUTES.HOME}       element={<PublicRoute><LandingPage /></PublicRoute>} />
                <Route path={ROUTES.LOGIN}      element={<PublicRoute><LoginPage /></PublicRoute>} />
                <Route path={ROUTES.REGISTER}   element={<RegisterPage />} />
                <Route path={ROUTES.CREATE_ORG} element={<PublicRoute><CreateOrgPage /></PublicRoute>} />

                {/* Post-signup onboarding — auth required, no sidebar */}
                <Route
                  path="/onboarding"
                  element={<RequireAuth><OnboardingPage /></RequireAuth>}
                />

                {/* Force-change-password — auth required, no sidebar */}
                <Route
                  path={ROUTES.CHANGE_PASSWORD}
                  element={<RequireAuth><ChangePasswordPage /></RequireAuth>}
                />

                {/* Protected — all share the sidebar layout */}
                <Route element={<ProtectedLayout />}>
                  <Route path={ROUTES.DASHBOARD} element={<DashboardRoute />} />
                  <Route path={ROUTES.BOARD}     element={<ProjectsPage />} />
                  <Route path={ROUTES.PROJECTS}  element={<Navigate to={ROUTES.BOARD} replace />} />
                  <Route path="/projects/:id"    element={<ProjectDetailPage />} />
                  <Route path={ROUTES.TEAM}      element={<RequireRole roles={['admin', 'project_manager', 'team_lead']}><TeamPage /></RequireRole>} />
                  <Route path={ROUTES.EMPLOYEES} element={<RequireRole roles={['admin']}><EmployeesPage /></RequireRole>} />
                  <Route path={ROUTES.REPORTS}   element={<RequireRole roles={['admin', 'project_manager', 'team_lead']}><ReportsPage /></RequireRole>} />
                  <Route path={ROUTES.SETTINGS}  element={<RequireRole roles={['admin']}><SettingsPage /></RequireRole>} />
                  <Route path={ROUTES.PROFILE}   element={<ProfilePage />} />
                  <Route path="/projects/:projectId/tasks/:taskId" element={<TaskDetailPage />} />
                </Route>

                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </div>
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

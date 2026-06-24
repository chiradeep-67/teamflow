import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppSidebar } from './components/layout/AppSidebar';
import LandingPage         from './pages/LandingPage';
import LoginPage           from './pages/LoginPage';
import RegisterPage        from './pages/RegisterPage';
import ChangePasswordPage  from './pages/ChangePasswordPage';
import CreateOrgPage       from './pages/CreateOrgPage';
import ProjectsPage        from './pages/ProjectsPage';
import ProjectDetailPage   from './pages/ProjectDetailPage';
import ProfilePage         from './pages/ProfilePage';
import TeamPage            from './pages/TeamPage';
import EmployeesPage       from './pages/EmployeesPage';
import SettingsPage        from './pages/SettingsPage';
import ReportsPage         from './pages/ReportsPage';
import { ROUTES }          from './utils/constants';

/* ─── Route guards ─────────────────────────────────────────────────────── */

function ProtectedLayout() {
  const { user, workspaceLoaded } = useAuth();

  if (!workspaceLoaded) return null; // wait for workspace fetch
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

/* ─── Placeholder pages ─────────────────────────────────────────────────── */
function ComingSoon({ title }) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-12 text-center">
      <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center mx-auto mb-4">
        <span className="text-2xl">🚧</span>
      </div>
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{title}</h2>
      <p className="text-sm text-gray-400 dark:text-gray-600">This page is coming in the next sprint.</p>
    </div>
  );
}

/* ─── App ──────────────────────────────────────────────────────────────── */
export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <div className="min-h-screen text-gray-900 dark:text-white transition-colors duration-300">
            <Routes>
              {/* Public */}
              <Route path={ROUTES.HOME}       element={<PublicRoute><LandingPage /></PublicRoute>} />
              <Route path={ROUTES.LOGIN}      element={<PublicRoute><LoginPage /></PublicRoute>} />
              <Route path={ROUTES.REGISTER}   element={<RegisterPage />} />
              <Route path={ROUTES.CREATE_ORG} element={<PublicRoute><CreateOrgPage /></PublicRoute>} />

              {/* Force-change-password — auth required, no sidebar */}
              <Route
                path={ROUTES.CHANGE_PASSWORD}
                element={<RequireAuth><ChangePasswordPage /></RequireAuth>}
              />

              {/* Protected — all share the sidebar layout */}
              <Route element={<ProtectedLayout />}>
                <Route path={ROUTES.DASHBOARD} element={<Navigate to={ROUTES.BOARD} replace />} />
                <Route path={ROUTES.BOARD}     element={<ProjectsPage />} />
                <Route path={ROUTES.PROJECTS}  element={<Navigate to={ROUTES.BOARD} replace />} />
                <Route path="/projects/:id"    element={<ProjectDetailPage />} />
                <Route path={ROUTES.TEAM}      element={<RequireRole roles={['admin', 'project_manager', 'team_lead']}><TeamPage /></RequireRole>} />
                <Route path={ROUTES.EMPLOYEES} element={<RequireRole roles={['admin']}><EmployeesPage /></RequireRole>} />
                <Route path={ROUTES.REPORTS}   element={<RequireRole roles={['admin', 'project_manager', 'team_lead']}><ReportsPage /></RequireRole>} />
                <Route path={ROUTES.SETTINGS}  element={<RequireRole roles={['admin']}><SettingsPage /></RequireRole>} />
                <Route path={ROUTES.PROFILE}   element={<ProfilePage />} />
                <Route path="/tasks/:id"       element={<ComingSoon title="Task Detail" />} />
              </Route>

              <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
            </Routes>
          </div>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

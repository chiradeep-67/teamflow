import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppSidebar } from './components/layout/AppSidebar';
import LandingPage       from './pages/LandingPage';
import LoginPage         from './pages/LoginPage';
import RegisterPage      from './pages/RegisterPage';
import DashboardPage     from './pages/DashboardPage';
import ProjectsPage      from './pages/ProjectsPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import ProfilePage       from './pages/ProfilePage';
import { ROUTES }        from './utils/constants';

/* ─── Route guards ─── */
function ProtectedLayout() {
  const { user } = useAuth();
  if (!user) return <Navigate to={ROUTES.LOGIN} replace />;
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">
      <AppSidebar />
      {/* push content down on mobile because of top bar */}
      <main className="flex-1 overflow-y-auto pt-14 lg:pt-0">
        <Outlet />
      </main>
    </div>
  );
}

function PublicRoute({ children }) {
  const { user } = useAuth();
  if (user) return <Navigate to={ROUTES.DASHBOARD} replace />;
  return children;
}

/* ─── Placeholder pages ─── */
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

/* ─── App ─── */
export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <div className="min-h-screen text-gray-900 dark:text-white transition-colors duration-300">
            <Routes>
              {/* Public */}
              <Route path={ROUTES.HOME}     element={<PublicRoute><LandingPage /></PublicRoute>} />
              <Route path={ROUTES.LOGIN}    element={<PublicRoute><LoginPage /></PublicRoute>} />
              <Route path={ROUTES.REGISTER} element={<PublicRoute><RegisterPage /></PublicRoute>} />

              {/* Protected — all share the sidebar layout */}
              <Route element={<ProtectedLayout />}>
                <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
                <Route path={ROUTES.PROJECTS}  element={<ProjectsPage />} />
                <Route path="/projects/:id"    element={<ProjectDetailPage />} />
                <Route path={ROUTES.BOARD}     element={<ComingSoon title="Workspace Board" />} />
                <Route path={ROUTES.TEAM}      element={<ComingSoon title="Team Management" />} />
                <Route path={ROUTES.REPORTS}   element={<ComingSoon title="Reports & Analytics" />} />
                <Route path={ROUTES.SETTINGS}  element={<ComingSoon title="Workspace Settings" />} />
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

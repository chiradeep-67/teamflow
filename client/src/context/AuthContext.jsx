import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI, projectsAPI, workspaceAPI } from '../services/api';

const AuthContext = createContext(null);

const TOKEN_KEY = 'tf_token';
const USER_KEY  = 'tf_user';

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(() => {
    try { return JSON.parse(localStorage.getItem(USER_KEY)) || null; }
    catch { return null; }
  });
  const [workspace, setWorkspace]       = useState(null);
  const [workspaceLoaded, setWorkspaceLoaded] = useState(false);
  const [isLoading, setIsLoading]       = useState(false);

  /* On mount: verify stored token + load workspace */
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);

    const loadWorkspace = () =>
      workspaceAPI.get()
        .then(res => setWorkspace(res.data.workspace))
        .catch(() => setWorkspace(null))
        .finally(() => setWorkspaceLoaded(true));

    if (!token) { setWorkspaceLoaded(true); return; }

    if (!user) {
      authAPI.me()
        .then(res => { setUser(res.data.user); return loadWorkspace(); })
        .catch((err) => {
          // Only clear credentials on a real auth failure (401), not network/timeout errors
          if (err.response?.status === 401) {
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
            setUser(null);
          }
          setWorkspaceLoaded(true);
        });
    } else {
      loadWorkspace();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const _persist = (token, userData) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    setUser(userData);
    workspaceAPI.get()
      .then(res => setWorkspace(res.data.workspace))
      .catch(() => setWorkspace(null));
  };

  /* ─── Login ─── */
  const login = async ({ email, password }) => {
    setIsLoading(true);
    try {
      const { data } = await authAPI.login({ email, password });
      _persist(data.token, data.user);
      return {
        success:            true,
        mustChangePassword: data.user.mustChangePassword,
      };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Login failed. Please try again.' };
    } finally {
      setIsLoading(false);
    }
  };

  /* ─── Create org (public signup) ─── */
  const createOrg = async ({ orgName, name, email, password, phone }) => {
    setIsLoading(true);
    try {
      const payload = { orgName, name, email, password };
      if (phone) payload.phone = phone;
      const { data } = await authAPI.createOrg(payload);
      _persist(data.token, data.user);
      return { success: true, message: data.message };
    } catch (err) {
      const msg = err.response?.data?.message
        || (err.code === 'ERR_NETWORK' ? 'Cannot reach the API — check that the backend is running and VITE_API_URL is set.' : null)
        || 'Failed to create organisation.';
      return { success: false, error: msg };
    } finally {
      setIsLoading(false);
    }
  };

  /* ─── Register (invite flow only) ─── */
  const register = async ({ name, email, password, phone, inviteToken }) => {
    setIsLoading(true);
    try {
      const payload = { name, email, password };
      if (phone)       payload.phone       = phone;
      if (inviteToken) payload.inviteToken = inviteToken;
      const { data } = await authAPI.register(payload);
      _persist(data.token, data.user);
      return { success: true, user: data.user };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Registration failed.' };
    } finally {
      setIsLoading(false);
    }
  };

  /* ─── Change password ─── */
  const changePassword = async ({ currentPassword, newPassword }) => {
    setIsLoading(true);
    try {
      const { data } = await authAPI.changePassword({ currentPassword, newPassword });
      // Re-persist with fresh token + cleared mustChangePassword flag
      _persist(data.token, data.user);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Failed to change password.' };
    } finally {
      setIsLoading(false);
    }
  };

  /* ─── Update user (profile save) ─── */
  const updateUser = (fields) => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, ...fields };
      localStorage.setItem(USER_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  /* ─── Logout ─── */
  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
    setWorkspace(null);
  };

  /* ─── Project helpers ─── */
  const getAccessibleProjects = useCallback(async () => {
    try {
      const { data } = await projectsAPI.getAll();
      return data.projects || [];
    } catch {
      return [];
    }
  }, []);

  const getProjectRole = useCallback((project) => {
    if (!user) return null;
    if (user.systemRole === 'admin') return 'admin';
    if (!project?.members) return null;
    const member = project.members.find(
      m => (m.user?._id || m.user) === user.id
    );
    return member?.projectRole ?? null;
  }, [user]);

  const isAdmin        = user?.systemRole === 'admin';
  const isPMOrAbove    = ['admin', 'project_manager'].includes(user?.systemRole);
  const isTLOrAbove    = ['admin', 'project_manager', 'team_lead'].includes(user?.systemRole);
  // keep isOwnerOrAdmin as alias so existing components don't break
  const isOwnerOrAdmin = isAdmin;

  return (
    <AuthContext.Provider value={{
      user,
      workspace,
      setWorkspace,
      workspaceLoaded,
      isAdmin,
      isOwnerOrAdmin,
      isPMOrAbove,
      isTLOrAbove,
      isLoading,
      login,
      register,
      createOrg,
      changePassword,
      logout,
      updateUser,
      getAccessibleProjects,
      getProjectRole,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

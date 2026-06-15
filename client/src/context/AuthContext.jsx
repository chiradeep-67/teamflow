import { createContext, useContext, useState } from 'react';
import { MOCK_USERS, MOCK_PROJECTS } from '../data/mockData';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Simulate login — in production this calls POST /api/auth/login
   * and receives a JWT.
   */
  const login = async ({ email, password }) => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setIsLoading(false);

    const found = MOCK_USERS.find(
      u => u.email.toLowerCase() === email.toLowerCase()
    );
    if (!found) return { success: false, error: 'No account found with that email.' };

    // In production: verify hashed password. Here we accept anything for demo.
    setUser(found);
    return { success: true };
  };

  /** Quick demo login — lets you jump in as any role instantly */
  const demoLogin = (userId) => {
    const found = MOCK_USERS.find(u => u.id === userId);
    if (found) setUser(found);
  };

  const register = async ({ name, email, role }) => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setIsLoading(false);

    const newUser = {
      id: `u${Date.now()}`,
      name,
      email,
      systemRole: role ?? 'member',
      avatar: name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
      department: 'Engineering',
      title: 'Team Member',
      joinedAt: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      bio: '',
    };
    setUser(newUser);
    return { success: true };
  };

  const logout = () => setUser(null);

  /**
   * Get all projects the current user has access to.
   * Admin → all projects. Others → only projects they're members of.
   */
  const getAccessibleProjects = () => {
    if (!user) return [];
    if (user.systemRole === 'admin') return MOCK_PROJECTS;
    return MOCK_PROJECTS.filter(p =>
      p.members.some(m => m.userId === user.id)
    );
  };

  /**
   * Get the user's role within a specific project.
   * Admin always gets 'admin'. Non-members get null.
   */
  const getProjectRole = (projectId) => {
    if (!user) return null;
    if (user.systemRole === 'admin') return 'admin';
    const project = MOCK_PROJECTS.find(p => p.id === projectId);
    return project?.members.find(m => m.userId === user.id)?.projectRole ?? null;
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      login,
      demoLogin,
      register,
      logout,
      getAccessibleProjects,
      getProjectRole,
      allUsers: MOCK_USERS,
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

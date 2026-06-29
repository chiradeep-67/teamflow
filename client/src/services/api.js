import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

/* ─── Request interceptor: attach JWT ─── */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('tf_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/* ─── Response interceptor: auto-logout on 401 ─── */
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('tf_token');
      localStorage.removeItem('tf_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

/* ─── Auth ─── */
export const authAPI = {
  setup:          ()     => api.get('/auth/setup'),
  register:       (data) => api.post('/auth/register', data),
  login:          (data) => api.post('/auth/login', data),
  me:             ()     => api.get('/auth/me'),
  changePassword: (data) => api.post('/auth/change-password', data),
  createOrg:      (data) => api.post('/auth/create-org', data),
};

/* ─── Users ─── */
export const usersAPI = {
  getAll:     ()         => api.get('/users'),
  getById:    (id)       => api.get(`/users/${id}`),
  create:     (data)     => api.post('/users', data),
  update:     (id, data) => api.put(`/users/${id}`, data),
  updateRole: (id, role) => api.put(`/users/${id}/role`, { systemRole: role }),
  deactivate:    (id)    => api.delete(`/users/${id}`),
  resetPassword: (id)    => api.post(`/users/${id}/reset-password`),
};

/* ─── Projects ─── */
export const projectsAPI = {
  getAll:        ()            => api.get('/projects'),
  getById:       (id)          => api.get(`/projects/${id}`),
  create:        (data)        => api.post('/projects', data),
  update:        (id, data)    => api.put(`/projects/${id}`, data),
  delete:        (id)          => api.delete(`/projects/${id}`),
  addMember:     (id, data)    => api.post(`/projects/${id}/members`, data),
  removeMember:  (id, userId)  => api.delete(`/projects/${id}/members/${userId}`),
};

/* ─── Tasks ─── */
export const tasksAPI = {
  getByProject:  (projectId)                => api.get(`/projects/${projectId}/tasks`),
  getById:       (projectId, taskId)        => api.get(`/projects/${projectId}/tasks/${taskId}`),
  create:        (projectId, data)          => api.post(`/projects/${projectId}/tasks`, data),
  update:        (projectId, taskId, data)  => api.put(`/projects/${projectId}/tasks/${taskId}`, data),
  delete:        (projectId, taskId)        => api.delete(`/projects/${projectId}/tasks/${taskId}`),
  addComment:    (projectId, taskId, text)  => api.post(`/projects/${projectId}/tasks/${taskId}/comments`, { text }),
};

/* ─── Workspace ─── */
export const workspaceAPI = {
  get:               ()           => api.get('/workspace'),
  create:            (data)       => api.post('/workspace', data),
  update:            (data)       => api.put('/workspace', data),
  addDepartment:     (name)       => api.post('/workspace/departments', { name }),
  deleteDepartment:  (name)       => api.delete(`/workspace/departments/${encodeURIComponent(name)}`),
};

/* ─── Invites ─── */
export const invitesAPI = {
  create:  (data)  => api.post('/invites', data),
  getAll:  ()      => api.get('/invites'),
  verify:  (token) => api.get(`/invites/verify/${token}`),
  revoke:  (id)    => api.delete(`/invites/${id}`),
};

/* ─── Notifications ─── */
export const notificationsAPI = {
  getAll:  ()   => api.get('/notifications'),
  markOne: (id) => api.patch(`/notifications/${id}/read`),
  markAll: ()   => api.patch('/notifications/read-all'),
};

export default api;

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, FolderKanban, Clock, Users, X, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import { RoleGate } from '../components/common/RoleGate';
import { RoleBadge } from '../components/common/RoleBadge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { MOCK_TASKS, MOCK_USERS } from '../data/mockData';
import { ROUTES } from '../utils/constants';
import { cn } from '../utils/cn';

const STATUS_STYLES = {
  active:    { label: 'Active',    cls: 'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400' },
  paused:    { label: 'Paused',    cls: 'bg-yellow-50 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400' },
  completed: { label: 'Completed', cls: 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400' },
};

const AVATAR_COLORS = {
  SC: 'from-red-500 to-rose-600', MR: 'from-indigo-500 to-violet-600',
  AJ: 'from-violet-500 to-purple-600', PS: 'from-teal-500 to-cyan-600',
  TK: 'from-amber-500 to-orange-500', AC: 'from-gray-400 to-gray-600',
};

/* ─── Create Project Modal ─── */
const COLORS = ['#6366f1','#8b5cf6','#14b8a6','#f59e0b','#ef4444','#22c55e','#ec4899','#3b82f6'];

function CreateModal({ onClose, onCreate }) {
  const [form, setForm] = useState({ name: '', description: '', color: COLORS[0] });
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Project name is required'); return; }
    onCreate(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/70 dark:border-gray-700 animate-slide-up overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Create New Project</h2>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"><X size={15} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Color</p>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map(c => (
                <button key={c} type="button" onClick={() => setForm(f => ({ ...f, color: c }))}
                  className={cn('w-7 h-7 rounded-lg transition-all', form.color === c ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-900 scale-110' : 'hover:scale-105')}
                  style={{ backgroundColor: c, outlineColor: c }} />
              ))}
            </div>
          </div>
          <Input label="Project name" placeholder="e.g. E-commerce Platform v2" value={form.name}
            onChange={e => { setForm(f => ({ ...f, name: e.target.value })); setError(''); }} error={error} autoFocus />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
            <textarea placeholder="Describe the project goals…" value={form.description} rows={3}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="w-full rounded-lg text-sm bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700/60 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 px-3.5 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all" />
          </div>
          <div className="flex gap-2 pt-1">
            <Button type="button" variant="secondary" fullWidth onClick={onClose}>Cancel</Button>
            <Button type="submit" fullWidth>Create project</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Project Card ─── */
function ProjectCard({ project, userRole }) {
  const tasks = MOCK_TASKS.filter(t => t.projectId === project.id);
  const done  = tasks.filter(t => t.status === 'done').length;
  const pct   = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
  const S     = STATUS_STYLES[project.status];

  const memberUsers = project.members.map(m => ({
    ...m,
    user: MOCK_USERS.find(u => u.id === m.userId),
  }));

  return (
    <Link to={`/projects/${project.id}`}
      className="group flex flex-col bg-white dark:bg-gray-900 rounded-xl border border-gray-200/70 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-200 overflow-hidden">
      <div className="h-1.5 w-full" style={{ backgroundColor: project.color }} />
      <div className="p-5 flex flex-col flex-1 gap-3">
        {/* Header */}
        <div className="flex items-start gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${project.color}18` }}>
            <FolderKanban size={16} style={{ color: project.color }} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {project.name}
            </h3>
            <span className={cn('text-[10px] font-medium px-1.5 py-0.5 rounded-md', S.cls)}>{S.label}</span>
          </div>
          {/* User's role in this project */}
          {userRole && <RoleBadge role={userRole} size="xs" />}
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2 flex-1">
          {project.description}
        </p>

        {/* Tags */}
        {project.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {project.tags.map(tag => (
              <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">{tag}</span>
            ))}
          </div>
        )}

        {/* Progress */}
        <div>
          <div className="flex justify-between text-xs text-gray-400 dark:text-gray-600 mb-1.5">
            <span>{done}/{tasks.length} tasks</span>
            <span>{pct}%</span>
          </div>
          <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: project.color }} />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-600">
            <Clock size={11} /><span>{project.dueDate}</span>
          </div>
          <div className="flex -space-x-1.5">
            {memberUsers.slice(0, 4).map(({ user: u, userId }) => u && (
              <div key={userId} className={cn('w-6 h-6 rounded-full text-[9px] font-semibold text-white flex items-center justify-center bg-gradient-to-br ring-2 ring-white dark:ring-gray-900', AVATAR_COLORS[u.avatar] ?? 'from-gray-400 to-gray-600')}>
                {u.avatar?.[0]}
              </div>
            ))}
            {memberUsers.length > 4 && (
              <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 ring-2 ring-white dark:ring-gray-900 text-[9px] font-semibold text-gray-500 flex items-center justify-center">+{memberUsers.length - 4}</div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ─── Page ─── */
export default function ProjectsPage() {
  const { getAccessibleProjects, getProjectRole, user } = useAuth();
  const [projects, setProjects] = useState(getAccessibleProjects);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);

  const handleCreate = (form) => {
    setProjects(ps => [...ps, {
      id: `p${Date.now()}`, name: form.name, description: form.description || 'No description.',
      status: 'active', color: form.color, startDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      dueDate: 'TBD', tags: [], members: [{ userId: user.id, projectRole: 'project_manager' }],
    }]);
  };

  const filtered = projects
    .filter(p => filter === 'all' || p.status === filter)
    .filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  const FILTERS = [
    { key: 'all', label: 'All' },
    { key: 'active', label: 'Active' },
    { key: 'paused', label: 'Paused' },
    { key: 'completed', label: 'Completed' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-7">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Projects</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {projects.filter(p => p.status === 'active').length} active · {projects.length} total
          </p>
        </div>
        <RoleGate roles={['admin', 'project_manager']}>
          <Button size="sm" leftIcon={<Plus size={13} />} onClick={() => setShowModal(true)}>
            New project
          </Button>
        </RoleGate>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="w-full sm:w-60">
          <Input placeholder="Search projects…" value={search} onChange={e => setSearch(e.target.value)} leftIcon={<Search size={14} />} />
        </div>
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800/60 rounded-lg p-1">
          {FILTERS.map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className={cn('px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                filter === f.key ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200')}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(p => (
            <ProjectCard key={p.id} project={p} userRole={getProjectRole(p.id)} />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl">
          <FolderKanban size={32} className="text-gray-300 dark:text-gray-700 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {search ? 'No projects match your search' : "You haven't been added to any projects yet"}
          </p>
          <RoleGate roles={['admin', 'project_manager']}>
            <Button size="sm" leftIcon={<Plus size={13} />} className="mt-4" onClick={() => setShowModal(true)}>
              Create first project
            </Button>
          </RoleGate>
        </div>
      )}

      {showModal && <CreateModal onClose={() => setShowModal(false)} onCreate={handleCreate} />}
    </div>
  );
}

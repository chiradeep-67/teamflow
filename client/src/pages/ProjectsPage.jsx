import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, FolderKanban, Clock, Users, X, Loader2, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { RoleGate } from '../components/common/RoleGate';
import { RoleBadge } from '../components/common/RoleBadge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { projectsAPI, tasksAPI } from '../services/api';
import { ROUTES } from '../utils/constants';
import { cn } from '../utils/cn';

const STATUS_STYLES = {
  active:    { label: 'Active',    cls: 'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400' },
  paused:    { label: 'Paused',    cls: 'bg-yellow-50 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400' },
  completed: { label: 'Completed', cls: 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400' },
  archived:  { label: 'Archived',  cls: 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500' },
};

const COLORS = ['#6366f1','#8b5cf6','#14b8a6','#f59e0b','#ef4444','#22c55e','#ec4899','#3b82f6'];

/* ─── Create Project Modal ─── */
function CreateModal({ onClose, onCreate, loading }) {
  const [form, setForm]   = useState({ name: '', description: '', color: COLORS[0], startDate: '', dueDate: '', tags: '' });
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Project name is required'); return; }
    const payload = {
      name:        form.name.trim(),
      description: form.description,
      color:       form.color,
      ...(form.startDate && { startDate: form.startDate }),
      ...(form.dueDate   && { dueDate:   form.dueDate }),
      ...(form.tags.trim() && { tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) }),
    };
    onCreate(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/70 dark:border-gray-700 animate-slide-up overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Create New Project</h2>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"><X size={15} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {/* Color picker */}
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Color</p>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map(c => (
                <button key={c} type="button" onClick={() => setForm(f => ({ ...f, color: c }))}
                  className={cn('w-7 h-7 rounded-lg transition-all', form.color === c ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-900 scale-110' : 'hover:scale-105')}
                  style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>

          <Input label="Project name *" placeholder="e.g. E-commerce Platform v2" value={form.name}
            onChange={e => { setForm(f => ({ ...f, name: e.target.value })); setError(''); }} error={error} autoFocus />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
            <textarea placeholder="Describe the project goals…" value={form.description} rows={2}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="w-full rounded-lg text-sm bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700/60 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 px-3.5 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all" />
          </div>

          {/* Start & Due dates */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Start date</label>
              <div className="relative">
                <Calendar size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                  className="w-full h-10 pl-8 pr-3 rounded-lg text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all" />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Due date</label>
              <div className="relative">
                <Calendar size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
                  className="w-full h-10 pl-8 pr-3 rounded-lg text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all" />
              </div>
            </div>
          </div>

          {/* Tags */}
          <Input
            label="Tags"
            placeholder="e.g. Frontend, API, Design (comma-separated)"
            value={form.tags}
            onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
          />

          <div className="flex gap-2 pt-1">
            <Button type="button" variant="secondary" fullWidth onClick={onClose}>Cancel</Button>
            <Button type="submit" fullWidth isLoading={loading}>Create project</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Project Card ─── */
function ProjectCard({ project, taskCount, doneCount, userRole }) {
  const pct = taskCount ? Math.round((doneCount / taskCount) * 100) : 0;
  const S   = STATUS_STYLES[project.status] ?? STATUS_STYLES.active;

  return (
    <Link to={`/projects/${project._id}`}
      className="group flex flex-col bg-white dark:bg-gray-900 rounded-xl border border-gray-200/70 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-200 overflow-hidden">
      <div className="h-1.5 w-full" style={{ backgroundColor: project.color || '#6366f1' }} />
      <div className="p-5 flex flex-col flex-1 gap-3">
        <div className="flex items-start gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${project.color || '#6366f1'}18` }}>
            <FolderKanban size={16} style={{ color: project.color || '#6366f1' }} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {project.name}
            </h3>
            <span className={cn('text-[10px] font-medium px-1.5 py-0.5 rounded-md', S.cls)}>{S.label}</span>
          </div>
          {userRole && <RoleBadge role={userRole} size="xs" />}
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2 flex-1">
          {project.description || 'No description.'}
        </p>

        {project.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {project.tags.map(tag => (
              <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">{tag}</span>
            ))}
          </div>
        )}

        <div>
          <div className="flex justify-between text-xs text-gray-400 dark:text-gray-600 mb-1.5">
            <span>{doneCount}/{taskCount} tasks</span>
            <span>{pct}%</span>
          </div>
          <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: project.color || '#6366f1' }} />
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-600">
            <Clock size={11} />
            <span>{project.dueDate ? new Date(project.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No due date'}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-600">
            <Users size={11} />
            <span>{project.members?.length ?? 0}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ─── Page ─── */
export default function ProjectsPage() {
  const { user, getProjectRole, isPMOrAbove } = useAuth();
  const canCreateProject = user?.systemRole === 'project_manager';

  const [projects, setProjects]     = useState([]);
  const [taskMap, setTaskMap]       = useState({});   // { projectId: { total, done } }
  const [loading, setLoading]       = useState(true);
  const [creating, setCreating]     = useState(false);
  const [search, setSearch]         = useState('');
  const [filter, setFilter]         = useState('all');
  const [showModal, setShowModal]   = useState(false);
  const [createError, setCreateError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const { data } = await projectsAPI.getAll();
        const list = data.projects || [];
        if (cancelled) return;
        setProjects(list);

        /* Fetch task counts per project */
        const results = await Promise.allSettled(
          list.map(p => tasksAPI.getByProject(p._id))
        );
        if (cancelled) return;
        const map = {};
        results.forEach((r, i) => {
          const id = list[i]._id;
          if (r.status === 'fulfilled') {
            const tasks = r.value.data.tasks || [];
            map[id] = { total: tasks.length, done: tasks.filter(t => t.status === 'done').length };
          } else {
            map[id] = { total: 0, done: 0 };
          }
        });
        setTaskMap(map);
      } catch {
        /* silent */
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  const handleCreate = async (form) => {
    setCreating(true);
    setCreateError('');
    try {
      const { data } = await projectsAPI.create(form);
      setProjects(ps => [...ps, data.project]);
      setTaskMap(m => ({ ...m, [data.project._id]: { total: 0, done: 0 } }));
      setShowModal(false);
    } catch (err) {
      setCreateError(err.response?.data?.message || 'Failed to create project.');
    } finally {
      setCreating(false);
    }
  };

  const filtered = projects
    .filter(p => filter === 'all' || p.status === filter)
    .filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  const FILTERS = [
    { key: 'all',       label: 'All' },
    { key: 'active',    label: 'Active' },
    { key: 'paused',    label: 'Paused' },
    { key: 'completed', label: 'Completed' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-7">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Projects</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {projects.filter(p => p.status === 'active').length} active · {projects.length} total
          </p>
        </div>
        {canCreateProject && (
          <Button size="sm" leftIcon={<Plus size={13} />} onClick={() => setShowModal(true)}>
            New project
          </Button>
        )}
      </div>

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

      {loading ? (
        <div className="flex items-center justify-center py-32">
          <Loader2 size={24} className="animate-spin text-indigo-500" />
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(p => (
            <ProjectCard
              key={p._id}
              project={p}
              taskCount={taskMap[p._id]?.total ?? 0}
              doneCount={taskMap[p._id]?.done ?? 0}
              userRole={getProjectRole(p)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl">
          <FolderKanban size={32} className="text-gray-300 dark:text-gray-700 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {search ? 'No projects match your search' : "You haven't been added to any projects yet"}
          </p>
          {canCreateProject && (
            <Button size="sm" leftIcon={<Plus size={13} />} className="mt-4" onClick={() => setShowModal(true)}>
              Create first project
            </Button>
          )}
        </div>
      )}

      {showModal && (
        <CreateModal
          onClose={() => setShowModal(false)}
          onCreate={handleCreate}
          loading={creating}
        />
      )}
    </div>
  );
}

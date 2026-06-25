import { useState, useRef, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Plus, Flame, AlertCircle, Circle,
  Clock, Search, X, Calendar, Loader2, Users, Trash2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { RoleBadge } from '../components/common/RoleBadge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { projectsAPI, tasksAPI, usersAPI } from '../services/api';
import { cn } from '../utils/cn';

/* ─── Config ─── */
const PRIORITY_MAP = {
  urgent: { icon: Flame,        cls: 'text-red-500',    label: 'Urgent', dot: 'bg-red-500' },
  high:   { icon: AlertCircle,  cls: 'text-orange-500', label: 'High',   dot: 'bg-orange-400' },
  medium: { icon: Circle,       cls: 'text-yellow-500', label: 'Medium', dot: 'bg-yellow-400' },
  low:    { icon: Circle,       cls: 'text-gray-300 dark:text-gray-600', label: 'Low', dot: 'bg-gray-300 dark:bg-gray-600' },
};

const TAG_COLORS = {
  Backend:  'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
  Frontend: 'bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400',
  Design:   'bg-pink-50 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400',
  Mobile:   'bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400',
  Security: 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400',
  Docs:     'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400',
  Payments: 'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400',
};

const COLS_CONFIG = [
  { id: 'todo',        label: 'To Do',       color: '#94a3b8' },
  { id: 'in_progress', label: 'In Progress', color: '#6366f1' },
  { id: 'in_review',   label: 'In Review',   color: '#8b5cf6' },
  { id: 'done',        label: 'Done',        color: '#22c55e' },
  { id: 'cancelled',   label: 'Cancelled',   color: '#ef4444' },
];

const STATUS_LABEL = { todo: 'To Do', in_progress: 'In Progress', in_review: 'In Review', done: 'Done', cancelled: 'Cancelled' };

/* ─── Avatar ─── */
function UserAvatar({ user, size = 'sm' }) {
  const sz = size === 'sm' ? 'w-6 h-6 text-[10px]' : 'w-7 h-7 text-xs';
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
  return (
    <div className={cn('rounded-full font-semibold text-white flex items-center justify-center bg-indigo-500', sz)}>
      {initials}
    </div>
  );
}

const PROJECT_ROLES = [
  { value: 'project_manager', label: 'Project Manager' },
  { value: 'team_lead',       label: 'Team Lead' },
  { value: 'member',          label: 'Member' },
  { value: 'client',          label: 'Client (read-only)' },
];

/* ─── Manage Team Modal ─── */
function ManageTeamModal({ project, onClose, onProjectUpdate, isAdminView }) {
  const [allUsers,    setAllUsers]    = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedRole, setSelectedRole] = useState('member');
  const [adding,       setAdding]       = useState(false);
  const [removing,     setRemoving]     = useState(null);
  const [error,        setError]        = useState('');

  const memberIds = new Set(project.members.map(m => m.user?._id || m.user));

  useEffect(() => {
    usersAPI.getAll()
      .then(res => setAllUsers(res.data.users || []))
      .catch(() => {})
      .finally(() => setLoadingUsers(false));
  }, []);

  const available = allUsers.filter(u => !memberIds.has(u._id || u.id));

  const handleAdd = async () => {
    if (!selectedUser) return;
    setAdding(true);
    setError('');
    try {
      const { data } = await projectsAPI.addMember(project._id, {
        userId: selectedUser,
        projectRole: selectedRole,
      });
      onProjectUpdate(data.project);
      setSelectedUser('');
      setSelectedRole('member');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign member');
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (userId) => {
    setRemoving(userId);
    setError('');
    try {
      const { data } = await projectsAPI.removeMember(project._id, userId);
      onProjectUpdate(data.project);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove member');
    } finally {
      setRemoving(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/70 dark:border-gray-700 animate-slide-up overflow-hidden max-h-[85vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
          <div className="flex items-center gap-2">
            <Users size={15} className="text-indigo-500" />
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Manage Team</h2>
            <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded-md">{project.members.length}</span>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
            <X size={15} />
          </button>
        </div>

        <div className="overflow-y-auto p-6 space-y-5 flex-1">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200/70 dark:border-red-500/20 text-red-600 dark:text-red-400 text-xs">
              {error}
            </div>
          )}

          {/* Current members — admin view only */}
          {isAdminView && (
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Current Members</p>
              <div className="space-y-2">
                {project.members.map(m => {
                  const u = m.user;
                  if (!u) return null;
                  const uid = u._id || u;
                  const roleLabel = PROJECT_ROLES.find(r => r.value === m.projectRole)?.label ?? m.projectRole;
                  return (
                    <div key={uid} className="flex items-center justify-between py-2 px-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-full bg-indigo-500 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                          {u.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-gray-900 dark:text-white truncate">{u.name}</p>
                          <p className="text-[10px] text-gray-400 dark:text-gray-600 truncate">{roleLabel}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemove(uid)}
                        disabled={removing === uid}
                        className="ml-2 w-6 h-6 rounded-md flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors shrink-0 disabled:opacity-40"
                        title="Remove from project"
                      >
                        {removing === uid
                          ? <Loader2 size={12} className="animate-spin" />
                          : <Trash2 size={12} />}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Assign member */}
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Assign Member</p>
            {loadingUsers ? (
              <div className="flex items-center gap-2 text-xs text-gray-400 py-2">
                <Loader2 size={13} className="animate-spin" /> Loading workspace members…
              </div>
            ) : available.length === 0 ? (
              <p className="text-xs text-gray-400 dark:text-gray-600 py-2">All workspace members are already in this project.</p>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={selectedUser}
                    onChange={e => setSelectedUser(e.target.value)}
                    className="h-9 rounded-lg text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 px-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all"
                  >
                    <option value="">Select person…</option>
                    {available.map(u => (
                      <option key={u._id} value={u._id}>{u.name}</option>
                    ))}
                  </select>
                  <select
                    value={selectedRole}
                    onChange={e => setSelectedRole(e.target.value)}
                    className="h-9 rounded-lg text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 px-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all"
                  >
                    {PROJECT_ROLES.map(r => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>
                <Button
                  fullWidth
                  size="sm"
                  onClick={handleAdd}
                  isLoading={adding}
                  disabled={!selectedUser || adding}
                  leftIcon={<Plus size={13} />}
                >
                  Assign to project
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Task Create / Edit Modal ─── */
function TaskModal({ project, task, onClose, onSave, saving, canAssign }) {
  const members = project?.members ?? [];

  const [form, setForm] = useState({
    title:         task?.title         ?? '',
    description:   task?.description   ?? '',
    priority:      task?.priority      ?? 'medium',
    status:        task?.status        ?? 'todo',
    assignedTo:    task?.assignedTo?._id ?? task?.assignedTo ?? '',
    dueDate:       task?.dueDate ? task.dueDate.slice(0, 10) : '',
    estimatedTime: task?.estimatedTime ?? '',
    tags:          task?.tags ?? [],
  });
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) { setError('Title is required'); return; }
    const payload = { ...(task?._id ? { _id: task._id } : {}), ...form };
    if (!payload.assignedTo) payload.assignedTo = null;
    onSave(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/70 dark:border-gray-700 animate-slide-up overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">{task?._id ? 'Edit Task' : 'Create Task'}</h2>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"><X size={15} /></button>
        </div>
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-4">
          {error && <p className="text-xs text-red-500">{error}</p>}

          <Input label="Title *" placeholder="e.g. Set up payment gateway" value={form.title}
            onChange={e => { setForm(f => ({ ...f, title: e.target.value })); setError(''); }} autoFocus />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
            <textarea rows={3} placeholder="Describe what needs to be done…" value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="w-full rounded-lg text-sm bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700/60 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 px-3.5 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Priority</label>
              <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
                className="h-10 rounded-lg text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all">
                <option value="urgent">🔴 Urgent</option>
                <option value="high">🟠 High</option>
                <option value="medium">🟡 Medium</option>
                <option value="low">⚪ Low</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                className="h-10 rounded-lg text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all">
                {COLS_CONFIG.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
            {canAssign && (
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Assign To</label>
                <select value={form.assignedTo} onChange={e => setForm(f => ({ ...f, assignedTo: e.target.value }))}
                  className="h-10 rounded-lg text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all">
                  <option value="">Unassigned</option>
                  {members.map(m => {
                    const u = m.user;
                    return u ? <option key={u._id} value={u._id}>{u.name}</option> : null;
                  })}
                </select>
              </div>
            )}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Due Date</label>
              <Input type="date" value={form.dueDate}
                onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
                leftIcon={<Calendar size={13} />} />
            </div>
            {canAssign && (
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Estimated Time</label>
                <Input
                  placeholder="e.g. 2h 30m"
                  value={form.estimatedTime}
                  onChange={e => setForm(f => ({ ...f, estimatedTime: e.target.value }))}
                  leftIcon={<Clock size={13} />}
                />
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="secondary" fullWidth onClick={onClose}>Cancel</Button>
            <Button type="submit" fullWidth isLoading={saving}>{task?._id ? 'Save changes' : 'Create task'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Task Card ─── */
function TaskCard({ task, onDragStart, onOpenTask, canEdit }) {
  const P = PRIORITY_MAP[task.priority] ?? PRIORITY_MAP.medium;
  const tagCls = task.tags?.[0] ? (TAG_COLORS[task.tags[0]] ?? 'bg-gray-100 dark:bg-gray-700 text-gray-500') : null;

  return (
    <div
      draggable={canEdit}
      onDragStart={canEdit ? (e) => onDragStart(e, task._id, task.status) : undefined}
      onClick={() => onOpenTask(task)}
      className={cn(
        'group bg-white dark:bg-gray-800 rounded-xl border border-gray-200/70 dark:border-gray-700/50',
        'p-3.5 select-none transition-all duration-150',
        canEdit ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer',
        'hover:border-indigo-200 dark:hover:border-indigo-500/40 hover:shadow-sm animate-fade-in',
      )}
    >
      <div className="flex items-center justify-between mb-2">
        {tagCls && task.tags?.[0]
          ? <span className={cn('text-[10px] font-semibold px-1.5 py-0.5 rounded-md', tagCls)}>{task.tags[0]}</span>
          : <span />}
        <P.icon size={13} className={P.cls} />
      </div>
      <p className={cn('text-sm font-medium leading-snug mb-2.5', task.status === 'done' ? 'line-through text-gray-400 dark:text-gray-600' : 'text-gray-800 dark:text-gray-200')}>
        {task.title}
      </p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-[10px] text-gray-400 dark:text-gray-600">
          <Clock size={10} />
          <span>{task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}</span>
        </div>
        {task.assignedTo && <UserAvatar user={task.assignedTo} size="sm" />}
      </div>
      {task.estimatedTime && (
        <div className="flex items-center gap-1 text-[10px] text-indigo-500 dark:text-indigo-400 mt-1.5">
          <Clock size={10} />
          <span>{task.estimatedTime}</span>
        </div>
      )}
    </div>
  );
}

/* ─── Kanban Column ─── */
function KanbanCol({ col, tasks, onDragStart, onDrop, onOpenTask, onAddTask, canCreate }) {
  const [isDragOver, setIsDragOver] = useState(false);

  return (
    <div className="flex flex-col w-60 shrink-0">
      <div className="flex items-center justify-between mb-3 px-0.5">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: col.color }} />
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{col.label}</span>
          <span className="text-xs text-gray-400 dark:text-gray-600 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded-md font-medium">{tasks.length}</span>
        </div>
        {canCreate && (
          <button onClick={() => onAddTask(col.id)} className="w-6 h-6 rounded-md flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <Plus size={13} />
          </button>
        )}
      </div>

      <div
        onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={e => { setIsDragOver(false); onDrop(e, col.id); }}
        className={cn(
          'flex-1 flex flex-col gap-2.5 rounded-xl p-2.5 min-h-[240px] transition-all duration-150 border-2',
          isDragOver ? 'bg-indigo-50/60 dark:bg-indigo-500/5 border-dashed border-indigo-300 dark:border-indigo-500/40' : 'bg-gray-50/60 dark:bg-gray-900/30 border-transparent'
        )}
      >
        {tasks.map(task => (
          <TaskCard key={task._id} task={task} onDragStart={onDragStart} onOpenTask={onOpenTask} canEdit={canCreate} />
        ))}
        {tasks.length === 0 && !isDragOver && (
          <div className="flex items-center justify-center flex-1 text-xs text-gray-300 dark:text-gray-700">
            Drop tasks here
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Task Detail Panel ─── */
function TaskPanel({ task, projectId, onClose, onEdit, onUpdate, canEdit, currentUser }) {
  const P = PRIORITY_MAP[task.priority] ?? PRIORITY_MAP.medium;
  const [comment, setComment]   = useState('');
  const [posting, setPosting]   = useState(false);
  const [localComments, setLocalComments] = useState(task.comments ?? []);

  const isMyTask   = (task.assignedTo?._id || task.assignedTo) === currentUser?.id;
  const showEdit   = canEdit || isMyTask;
  const isClient   = currentUser?.systemRole === 'client';

  const handleStatusChange = async (newStatus) => {
    if (!showEdit) return;
    await onUpdate(task._id, { status: newStatus });
  };

  const handleComment = async () => {
    if (!comment.trim() || isClient) return;
    setPosting(true);
    try {
      const { data } = await tasksAPI.addComment(projectId, task._id, comment.trim());
      setLocalComments(data.task.comments || []);
      setComment('');
    } catch {
      /* silently fail */
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 bg-black/30 dark:bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-[440px] bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 h-full overflow-y-auto shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900 z-10">
          <div className="flex items-center gap-2">
            <P.icon size={14} className={P.cls} />
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{P.label} priority</span>
          </div>
          <div className="flex items-center gap-1.5">
            {showEdit && <Button size="sm" variant="secondary" onClick={() => onEdit(task)}>Edit</Button>}
            <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"><X size={15} /></button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-2 leading-snug">{task.title}</h2>
            {task.description && <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{task.description}</p>}
          </div>

          {task.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {task.tags.map(tag => (
                <span key={tag} className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-md', TAG_COLORS[tag] ?? 'bg-gray-100 dark:bg-gray-700 text-gray-500')}>{tag}</span>
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
            <div>
              <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1">Assignee</p>
              {task.assignedTo
                ? <div className="flex items-center gap-1.5"><UserAvatar user={task.assignedTo} /><span className="text-xs font-medium text-gray-800 dark:text-gray-200">{task.assignedTo.name?.split(' ')[0]}</span></div>
                : <span className="text-xs text-gray-400">Unassigned</span>}
            </div>
            <div>
              <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1">Due Date</p>
              <p className="text-xs font-medium text-gray-800 dark:text-gray-200">
                {task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1">Created By</p>
              <p className="text-xs font-medium text-gray-800 dark:text-gray-200">{task.createdBy?.name?.split(' ')[0] ?? '—'}</p>
            </div>
            <div>
              <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1">Status</p>
              {showEdit ? (
                <select value={task.status} onChange={e => handleStatusChange(e.target.value)}
                  className="text-xs bg-transparent border-none text-gray-800 dark:text-gray-200 font-medium focus:outline-none cursor-pointer">
                  {COLS_CONFIG.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
              ) : (
                <p className="text-xs font-medium text-gray-800 dark:text-gray-200">{STATUS_LABEL[task.status]}</p>
              )}
            </div>
            <div className="col-span-2">
              <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1">Estimated Time</p>
              <p className="text-xs font-medium text-gray-800 dark:text-gray-200 flex items-center gap-1">
                <Clock size={11} className="text-gray-400" />
                {task.estimatedTime || '—'}
              </p>
            </div>
          </div>

          {/* Comments */}
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              Comments ({localComments.length})
            </p>
            {localComments.length > 0 ? (
              <div className="space-y-3 mb-4">
                {localComments.map((c, i) => (
                  <div key={c._id ?? i} className="flex items-start gap-2.5">
                    <UserAvatar user={c.author} size="sm" />
                    <div className="flex-1 min-w-0 bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">{c.author?.name?.split(' ')[0] ?? 'User'}</span>
                        <span className="text-[10px] text-gray-400">{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : ''}</span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{c.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 dark:text-gray-600 mb-4">No comments yet.</p>
            )}

            {!isClient && (
              <div>
                <textarea value={comment} onChange={e => setComment(e.target.value)} rows={2}
                  placeholder="Add a comment…"
                  className="w-full rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 px-3.5 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all" />
                <div className="flex justify-end mt-2">
                  <Button size="sm" onClick={handleComment} isLoading={posting} disabled={!comment.trim()}>Post comment</Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Page ─── */
export default function ProjectDetailPage() {
  const { id } = useParams();
  const { user, getProjectRole } = useAuth();

  const [project, setProject]         = useState(null);
  const [tasks, setTasks]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [notFound, setNotFound]       = useState(false);
  const [activeTask, setActiveTask]   = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [newTaskCol, setNewTaskCol]   = useState(null);
  const [saving, setSaving]           = useState(false);
  const [search, setSearch]           = useState('');
  const [manageTeam, setManageTeam]   = useState(false);
  const dragging = useRef({ taskId: null, fromCol: null });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const [pRes, tRes] = await Promise.all([
          projectsAPI.getById(id),
          tasksAPI.getByProject(id),
        ]);
        if (!cancelled) {
          setProject(pRes.data.project);
          setTasks(tRes.data.tasks || []);
        }
      } catch (err) {
        if (!cancelled) setNotFound(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={24} className="animate-spin text-indigo-500" />
      </div>
    );
  }

  if (notFound || !project) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Project not found or you don&apos;t have access.</p>
        <Link to="/board" className="text-indigo-600 text-sm hover:underline mt-2 inline-block">← Back to board</Link>
      </div>
    );
  }

  const projectRole = getProjectRole(project);

  if (!projectRole) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">You don&apos;t have access to this project.</p>
        <Link to="/board" className="text-indigo-600 text-sm hover:underline mt-2 inline-block">← Back to board</Link>
      </div>
    );
  }

  const canCreate    = ['admin', 'project_manager', 'team_lead'].includes(projectRole);
  const canEdit      = canCreate;
  const canAssign    = ['project_manager', 'team_lead'].includes(projectRole);
  const canManageTeam = ['admin', 'project_manager'].includes(projectRole);

  const doneTasks = tasks.filter(t => t.status === 'done').length;
  const pct       = tasks.length ? Math.round((doneTasks / tasks.length) * 100) : 0;

  /* ─── Drag handlers ─── */
  const handleDragStart = (e, taskId, fromCol) => {
    dragging.current = { taskId, fromCol };
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = async (e, toCol) => {
    e.preventDefault();
    const { taskId, fromCol } = dragging.current;
    if (!taskId || fromCol === toCol) return;
    dragging.current = { taskId: null, fromCol: null };

    /* Optimistic update */
    setTasks(prev => prev.map(t => t._id === taskId ? { ...t, status: toCol } : t));

    try {
      await tasksAPI.update(id, taskId, { status: toCol });
    } catch {
      /* Revert on failure */
      setTasks(prev => prev.map(t => t._id === taskId ? { ...t, status: fromCol } : t));
    }
  };

  /* ─── Update task (status change from panel) ─── */
  const handleUpdate = async (taskId, data) => {
    setTasks(prev => prev.map(t => t._id === taskId ? { ...t, ...data } : t));
    if (activeTask?._id === taskId) setActiveTask(prev => ({ ...prev, ...data }));
    try {
      await tasksAPI.update(id, taskId, data);
    } catch {
      /* revert not implemented — reload page if needed */
    }
  };

  /* ─── Save task (create / edit) ─── */
  const handleSaveTask = async (formData) => {
    setSaving(true);
    try {
      if (formData._id) {
        const { data } = await tasksAPI.update(id, formData._id, formData);
        setTasks(prev => prev.map(t => t._id === formData._id ? data.task : t));
      } else {
        const { data } = await tasksAPI.create(id, formData);
        setTasks(prev => [...prev, data.task]);
      }
      setEditingTask(null);
      setNewTaskCol(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save task');
    } finally {
      setSaving(false);
    }
  };

  const filteredTasks = search
    ? tasks.filter(t => t.title.toLowerCase().includes(search.toLowerCase()))
    : tasks;

  return (
    <div className="flex flex-col h-[calc(100vh-0px)] lg:h-screen overflow-hidden">
      {/* Project header */}
      <div className="shrink-0 px-6 py-4 bg-white dark:bg-gray-900 border-b border-gray-200/70 dark:border-gray-800">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link to="/board" className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors shrink-0">
              <ArrowLeft size={16} />
            </Link>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${project.color || '#6366f1'}20` }}>
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: project.color || '#6366f1' }} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-gray-900 dark:text-white truncate">{project.name}</h1>
                <RoleBadge role={projectRole} size="xs" />
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-600 mt-0.5">
                {tasks.length} tasks · {pct}% complete
                {project.dueDate && ` · Due ${new Date(project.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="hidden sm:flex -space-x-1.5">
              {project.members?.slice(0, 5).map((m) => m.user && (
                <div key={m.user._id} title={m.user.name} className="ring-2 ring-white dark:ring-gray-900 rounded-full">
                  <UserAvatar user={m.user} size="sm" />
                </div>
              ))}
            </div>
            {canManageTeam && (
              <button
                onClick={() => setManageTeam(true)}
                className="hidden sm:flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <Users size={12} />
                Team
              </button>
            )}
            <div className="relative hidden md:block">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tasks…"
                className="h-8 pl-8 pr-3 rounded-lg text-xs bg-gray-100 dark:bg-gray-800 border border-transparent text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:border-indigo-300 dark:focus:border-indigo-500/50 w-40 transition-all" />
            </div>
            {canCreate && (
              <Button size="sm" leftIcon={<Plus size={13} />} onClick={() => setNewTaskCol('todo')}>
                Add task
              </Button>
            )}
          </div>
        </div>
        <div className="mt-3 h-1 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: project.color || '#6366f1' }} />
        </div>
      </div>

      {/* Kanban board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="flex gap-4 p-6 min-w-max h-full items-start">
          {COLS_CONFIG.map(col => (
            <KanbanCol
              key={col.id}
              col={col}
              tasks={filteredTasks.filter(t => t.status === col.id)}
              onDragStart={handleDragStart}
              onDrop={handleDrop}
              onOpenTask={setActiveTask}
              onAddTask={(colId) => setNewTaskCol(colId)}
              canCreate={canCreate}
            />
          ))}
        </div>
      </div>

      {activeTask && (
        <TaskPanel
          task={activeTask}
          projectId={id}
          onClose={() => setActiveTask(null)}
          onEdit={(t) => { setEditingTask(t); setActiveTask(null); }}
          onUpdate={handleUpdate}
          canEdit={canEdit}
          currentUser={user}
        />
      )}

      {(newTaskCol !== null || editingTask) && (
        <TaskModal
          project={project}
          task={editingTask ? editingTask : { status: newTaskCol }}
          onClose={() => { setNewTaskCol(null); setEditingTask(null); }}
          onSave={handleSaveTask}
          saving={saving}
          canAssign={canAssign}
        />
      )}

      {manageTeam && (
        <ManageTeamModal
          project={project}
          onClose={() => setManageTeam(false)}
          onProjectUpdate={(updated) => setProject(updated)}
          isAdminView={projectRole === 'admin'}
        />
      )}
    </div>
  );
}

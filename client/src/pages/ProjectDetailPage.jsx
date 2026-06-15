import { useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Plus, MoreHorizontal, Flame, AlertCircle, Circle,
  Clock, Search, Users, Settings, X, Check, Calendar,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import { ProjectRoleGate } from '../components/common/RoleGate';
import { RoleBadge } from '../components/common/RoleBadge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { MOCK_TASKS, MOCK_USERS, MOCK_PROJECTS } from '../data/mockData';
import { cn } from '../utils/cn';

/* ─── Helpers ─── */
const AVATAR_COLORS = {
  SC:'from-red-500 to-rose-600', MR:'from-indigo-500 to-violet-600',
  AJ:'from-violet-500 to-purple-600', PS:'from-teal-500 to-cyan-600',
  TK:'from-amber-500 to-orange-500', AC:'from-gray-400 to-gray-600',
};

const PRIORITY_MAP = {
  urgent: { icon: Flame, cls: 'text-red-500',    label: 'Urgent', dot: 'bg-red-500' },
  high:   { icon: AlertCircle, cls: 'text-orange-500', label: 'High', dot: 'bg-orange-400' },
  medium: { icon: Circle, cls: 'text-yellow-500',  label: 'Medium', dot: 'bg-yellow-400' },
  low:    { icon: Circle, cls: 'text-gray-300 dark:text-gray-600', label: 'Low', dot: 'bg-gray-300 dark:bg-gray-600' },
};

const TAG_COLORS = {
  Backend: 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
  Frontend: 'bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400',
  Design: 'bg-pink-50 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400',
  Mobile: 'bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400',
  Security: 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400',
  Docs: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400',
  Payments: 'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400',
};

const COLS_CONFIG = [
  { id: 'todo',        label: 'To Do',       color: '#94a3b8' },
  { id: 'in_progress', label: 'In Progress', color: '#6366f1' },
  { id: 'in_review',   label: 'In Review',   color: '#8b5cf6' },
  { id: 'done',        label: 'Done',        color: '#22c55e' },
];

function Avatar({ initials, size = 'sm' }) {
  const sz = size === 'sm' ? 'w-6 h-6 text-[10px]' : 'w-7 h-7 text-xs';
  return (
    <div className={cn('rounded-full font-semibold text-white flex items-center justify-center bg-gradient-to-br', sz, AVATAR_COLORS[initials] ?? 'from-gray-400 to-gray-600')}>
      {initials?.[0]}
    </div>
  );
}

/* ─── Task Create/Edit Modal ─── */
function TaskModal({ project, task, onClose, onSave }) {
  const { allUsers } = useAuth();
  const projectMembers = project.members.map(m => allUsers.find(u => u.id === m.userId)).filter(Boolean);

  const [form, setForm] = useState({
    title: task?.title ?? '',
    description: task?.description ?? '',
    priority: task?.priority ?? 'medium',
    status: task?.status ?? 'todo',
    assignedTo: task?.assignedTo ?? '',
    dueDate: task?.dueDate ?? '',
    tags: task?.tags ?? [],
  });
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) { setError('Title is required'); return; }
    onSave({ ...task, ...form, id: task?.id ?? `t${Date.now()}`, projectId: project.id, createdBy: task?.createdBy ?? 'u1', comments: task?.comments ?? [] });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/70 dark:border-gray-700 animate-slide-up overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">{task ? 'Edit Task' : 'Create Task'}</h2>
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
            {/* Priority */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Priority</label>
              <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
                className="h-10 rounded-lg text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all">
                <option value="urgent">🔴 Urgent</option>
                <option value="high">🟠 High</option>
                <option value="medium">🟡 Medium</option>
                <option value="low">⚪ Low</option>
              </select>
            </div>
            {/* Status */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                className="h-10 rounded-lg text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all">
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="in_review">In Review</option>
                <option value="done">Done</option>
              </select>
            </div>
            {/* Assigned To */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Assign To</label>
              <select value={form.assignedTo} onChange={e => setForm(f => ({ ...f, assignedTo: e.target.value }))}
                className="h-10 rounded-lg text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all">
                <option value="">Unassigned</option>
                {projectMembers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
            {/* Due Date */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Due Date</label>
              <Input type="text" placeholder="Jun 30, 2024" value={form.dueDate}
                onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
                leftIcon={<Calendar size={13} />} />
            </div>
          </div>

          <div className="flex gap-2 pt-2 shrink-0">
            <Button type="button" variant="secondary" fullWidth onClick={onClose}>Cancel</Button>
            <Button type="submit" fullWidth>{task ? 'Save changes' : 'Create task'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Task Card (Kanban) ─── */
function TaskCard({ task, project, onDragStart, onOpenTask, canEdit }) {
  const P = PRIORITY_MAP[task.priority];
  const assignee = MOCK_USERS.find(u => u.id === task.assignedTo);
  const tagCls = task.tags?.[0] ? (TAG_COLORS[task.tags[0]] ?? 'bg-gray-100 dark:bg-gray-700 text-gray-500') : null;

  return (
    <div
      draggable={canEdit}
      onDragStart={canEdit ? (e) => onDragStart(e, task.id, task.status) : undefined}
      onClick={() => onOpenTask(task)}
      className={cn(
        'group bg-white dark:bg-gray-800 rounded-xl border border-gray-200/70 dark:border-gray-700/50',
        'p-3.5 select-none transition-all duration-150',
        canEdit ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer',
        'hover:border-indigo-200 dark:hover:border-indigo-500/40 hover:shadow-sm',
        'animate-fade-in',
      )}
    >
      <div className="flex items-center justify-between mb-2">
        {tagCls && task.tags?.[0] ? (
          <span className={cn('text-[10px] font-semibold px-1.5 py-0.5 rounded-md', tagCls)}>{task.tags[0]}</span>
        ) : <span />}
        <P.icon size={13} className={P.cls} />
      </div>
      <p className={cn('text-sm font-medium leading-snug mb-2.5', task.status === 'done' ? 'line-through text-gray-400 dark:text-gray-600' : 'text-gray-800 dark:text-gray-200')}>
        {task.title}
      </p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-[10px] text-gray-400 dark:text-gray-600">
          <Clock size={10} /><span>{task.dueDate}</span>
        </div>
        {assignee && <Avatar initials={assignee.avatar} />}
      </div>
    </div>
  );
}

/* ─── Kanban Column ─── */
function KanbanCol({ col, tasks, project, onDragStart, onDrop, onOpenTask, onAddTask, canCreate }) {
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
          <TaskCard key={task.id} task={task} project={project}
            onDragStart={onDragStart} onOpenTask={onOpenTask} canEdit={canCreate} />
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
function TaskPanel({ task, project, onClose, onEdit, onSave, canEdit }) {
  const { user } = useAuth();
  const P = PRIORITY_MAP[task.priority];
  const assignee = MOCK_USERS.find(u => u.id === task.assignedTo);
  const creator  = MOCK_USERS.find(u => u.id === task.createdBy);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState(task.comments ?? []);

  // Members can only edit if it's assigned to them
  const isMyTask = task.assignedTo === user?.id;
  const showEdit = canEdit || isMyTask;

  const handleStatusChange = (newStatus) => {
    if (!isMyTask && !canEdit) return;
    onSave({ ...task, status: newStatus });
  };

  const handleComment = () => {
    if (!comment.trim()) return;
    setComments(prev => [...prev, { id: `c${Date.now()}`, userId: user.id, text: comment.trim(), createdAt: 'Just now' }]);
    setComment('');
  };

  const STATUS_OPTIONS = ['todo', 'in_progress', 'in_review', 'done'];
  const STATUS_LABEL   = { todo:'To Do', in_progress:'In Progress', in_review:'In Review', done:'Done' };

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 bg-black/30 dark:bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-[440px] bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 h-full overflow-y-auto shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900 z-10">
          <div className="flex items-center gap-2">
            <P.icon size={14} className={P.cls} />
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{P.label} priority</span>
          </div>
          <div className="flex items-center gap-1.5">
            {showEdit && (
              <Button size="sm" variant="secondary" onClick={() => onEdit(task)}>Edit</Button>
            )}
            <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"><X size={15} /></button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Title + description */}
          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-2 leading-snug">{task.title}</h2>
            {task.description && <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{task.description}</p>}
          </div>

          {/* Tags */}
          {task.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {task.tags.map(tag => (
                <span key={tag} className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-md', TAG_COLORS[tag] ?? 'bg-gray-100 dark:bg-gray-700 text-gray-500')}>{tag}</span>
              ))}
            </div>
          )}

          {/* Metadata grid */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
            <div>
              <p className="text-[10px] font-medium text-gray-400 dark:text-gray-600 uppercase tracking-wider mb-1">Assignee</p>
              {assignee ? (
                <div className="flex items-center gap-1.5">
                  <Avatar initials={assignee.avatar} size="sm" />
                  <span className="text-xs font-medium text-gray-800 dark:text-gray-200">{assignee.name.split(' ')[0]}</span>
                </div>
              ) : <span className="text-xs text-gray-400">Unassigned</span>}
            </div>
            <div>
              <p className="text-[10px] font-medium text-gray-400 dark:text-gray-600 uppercase tracking-wider mb-1">Due date</p>
              <p className="text-xs font-medium text-gray-800 dark:text-gray-200">{task.dueDate || '—'}</p>
            </div>
            <div>
              <p className="text-[10px] font-medium text-gray-400 dark:text-gray-600 uppercase tracking-wider mb-1">Created by</p>
              <p className="text-xs font-medium text-gray-800 dark:text-gray-200">{creator?.name?.split(' ')[0] ?? '—'}</p>
            </div>
            <div>
              <p className="text-[10px] font-medium text-gray-400 dark:text-gray-600 uppercase tracking-wider mb-1">Status</p>
              {(showEdit) ? (
                <select value={task.status} onChange={e => handleStatusChange(e.target.value)}
                  className="text-xs bg-transparent border-none text-gray-800 dark:text-gray-200 font-medium focus:outline-none cursor-pointer">
                  {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                </select>
              ) : (
                <p className="text-xs font-medium text-gray-800 dark:text-gray-200">{STATUS_LABEL[task.status]}</p>
              )}
            </div>
          </div>

          {/* Comments */}
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Comments ({comments.length})</p>
            {comments.length > 0 ? (
              <div className="space-y-3 mb-4">
                {comments.map(c => {
                  const author = MOCK_USERS.find(u => u.id === c.userId);
                  return (
                    <div key={c.id} className="flex items-start gap-2.5">
                      <Avatar initials={author?.avatar ?? '?'} size="sm" />
                      <div className="flex-1 min-w-0 bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">{author?.name?.split(' ')[0]}</span>
                          <span className="text-[10px] text-gray-400">{c.createdAt}</span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{c.text}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-gray-400 dark:text-gray-600 mb-4">No comments yet. Be the first to add one.</p>
            )}

            {/* Comment box — not available to client */}
            {user?.systemRole !== 'client' && (
              <div>
                <textarea value={comment} onChange={e => setComment(e.target.value)} rows={2}
                  placeholder="Add a comment…"
                  className="w-full rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 px-3.5 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all" />
                <div className="flex justify-end mt-2">
                  <Button size="sm" onClick={handleComment} disabled={!comment.trim()}>Post comment</Button>
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

  const project = MOCK_PROJECTS.find(p => p.id === id);
  const projectRole = getProjectRole(id);

  const [tasks, setTasks] = useState(MOCK_TASKS.filter(t => t.projectId === id));
  const [activeTask, setActiveTask] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [newTaskCol, setNewTaskCol] = useState(null);
  const [search, setSearch] = useState('');
  const dragging = useRef({ taskId: null, fromCol: null });

  if (!project) return (
    <div className="p-6 text-center">
      <p className="text-gray-500">Project not found or you don't have access.</p>
      <Link to="/projects" className="text-indigo-600 text-sm hover:underline mt-2 inline-block">← Back to projects</Link>
    </div>
  );

  if (!projectRole) return (
    <div className="p-6 text-center">
      <p className="text-gray-500">You don't have access to this project.</p>
      <Link to="/projects" className="text-indigo-600 text-sm hover:underline mt-2 inline-block">← Back to projects</Link>
    </div>
  );

  const canCreate = ['admin', 'project_manager', 'team_lead'].includes(projectRole);
  const canEdit   = canCreate; // PM/TL/Admin can edit any task
  const isClient  = projectRole === 'client';

  const doneTasks = tasks.filter(t => t.status === 'done').length;
  const pct = tasks.length ? Math.round((doneTasks / tasks.length) * 100) : 0;

  const handleDragStart = (e, taskId, fromCol) => {
    dragging.current = { taskId, fromCol };
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = (e, toCol) => {
    e.preventDefault();
    const { taskId, fromCol } = dragging.current;
    if (!taskId || fromCol === toCol) return;
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: toCol } : t));
    dragging.current = { taskId: null, fromCol: null };
  };

  const handleSaveTask = (updatedTask) => {
    setTasks(prev => {
      const exists = prev.find(t => t.id === updatedTask.id);
      if (exists) return prev.map(t => t.id === updatedTask.id ? updatedTask : t);
      return [...prev, updatedTask];
    });
    setActiveTask(updatedTask);
  };

  const filteredTasks = search
    ? tasks.filter(t => t.title.toLowerCase().includes(search.toLowerCase()))
    : tasks;

  const memberUsers = project.members.map(m => ({
    ...m, user: MOCK_USERS.find(u => u.id === m.userId),
  }));

  return (
    <div className="flex flex-col h-[calc(100vh-0px)] lg:h-screen overflow-hidden">
      {/* Project header */}
      <div className="shrink-0 px-6 py-4 bg-white dark:bg-gray-900 border-b border-gray-200/70 dark:border-gray-800">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link to="/projects" className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors shrink-0">
              <ArrowLeft size={16} />
            </Link>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${project.color}20` }}>
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: project.color }} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-gray-900 dark:text-white truncate">{project.name}</h1>
                <RoleBadge role={projectRole} size="xs" />
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-600 mt-0.5">{tasks.length} tasks · {pct}% complete · Due {project.dueDate}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Members */}
            <div className="hidden sm:flex -space-x-1.5">
              {memberUsers.slice(0, 5).map(({ user: u, userId }) => u && (
                <div key={userId} title={u.name} className={cn('w-7 h-7 rounded-full text-[10px] font-semibold text-white flex items-center justify-center bg-gradient-to-br ring-2 ring-white dark:ring-gray-900', AVATAR_COLORS[u.avatar] ?? 'from-gray-400 to-gray-600')}>
                  {u.avatar?.[0]}
                </div>
              ))}
            </div>

            {/* Search */}
            <div className="relative hidden md:block">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tasks…"
                className="h-8 pl-8 pr-3 rounded-lg text-xs bg-gray-100 dark:bg-gray-800 border border-transparent text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:border-indigo-300 dark:focus:border-indigo-500/50 w-40 transition-all" />
            </div>

            {/* Add task — only for PM, TL, Admin */}
            {canCreate && (
              <Button size="sm" leftIcon={<Plus size={13} />} onClick={() => setNewTaskCol('todo')}>
                Add task
              </Button>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3 h-1 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: project.color }} />
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
              project={project}
              onDragStart={handleDragStart}
              onDrop={handleDrop}
              onOpenTask={setActiveTask}
              onAddTask={(colId) => setNewTaskCol(colId)}
              canCreate={canCreate}
            />
          ))}
        </div>
      </div>

      {/* Task detail panel */}
      {activeTask && (
        <TaskPanel
          task={activeTask}
          project={project}
          onClose={() => setActiveTask(null)}
          onEdit={(t) => { setEditingTask(t); setActiveTask(null); }}
          onSave={handleSaveTask}
          canEdit={canEdit}
        />
      )}

      {/* Task create modal */}
      {(newTaskCol !== null || editingTask) && (
        <TaskModal
          project={project}
          task={editingTask ? editingTask : { status: newTaskCol }}
          onClose={() => { setNewTaskCol(null); setEditingTask(null); }}
          onSave={handleSaveTask}
        />
      )}
    </div>
  );
}

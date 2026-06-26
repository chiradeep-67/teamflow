import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Flame, AlertCircle, Circle, Clock, Calendar,
  MessageSquare, Send, Loader2, Pencil, Check, X, Trash2,
  User, Tag, Timer,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { tasksAPI, projectsAPI, usersAPI } from '../services/api';
import { RoleBadge } from '../components/common/RoleBadge';
import { Button } from '../components/ui/Button';
import { cn } from '../utils/cn';

/* ─── Config ─── */
const PRIORITY_MAP = {
  urgent: { icon: Flame,       cls: 'text-red-500',    label: 'Urgent',  dot: 'bg-red-500'    },
  high:   { icon: AlertCircle, cls: 'text-orange-500', label: 'High',    dot: 'bg-orange-400' },
  medium: { icon: Circle,      cls: 'text-yellow-500', label: 'Medium',  dot: 'bg-yellow-400' },
  low:    { icon: Circle,      cls: 'text-gray-400',   label: 'Low',     dot: 'bg-gray-300 dark:bg-gray-600' },
};

const STATUS_OPTIONS = [
  { value: 'todo',        label: 'To Do',       color: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300' },
  { value: 'in_progress', label: 'In Progress', color: 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300' },
  { value: 'in_review',   label: 'In Review',   color: 'bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300' },
  { value: 'done',        label: 'Done',        color: 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300' },
  { value: 'cancelled',   label: 'Cancelled',   color: 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300' },
];

const PRIORITY_OPTIONS = ['urgent', 'high', 'medium', 'low'];

const TAG_COLORS = {
  Backend:  'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
  Frontend: 'bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400',
  Design:   'bg-pink-50 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400',
  Mobile:   'bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400',
  Security: 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400',
  Docs:     'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400',
};

/* ─── Avatar ─── */
function Avatar({ user, size = 'sm' }) {
  const sz = size === 'sm' ? 'w-7 h-7 text-xs' : 'w-9 h-9 text-sm';
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
  const COLORS = ['bg-indigo-500', 'bg-violet-500', 'bg-teal-500', 'bg-amber-500', 'bg-rose-500'];
  const color = COLORS[(user?.name?.charCodeAt(0) || 0) % COLORS.length];
  return (
    <div className={cn('rounded-full font-semibold text-white flex items-center justify-center shrink-0', sz, color)}>
      {initials}
    </div>
  );
}

/* ─── Inline editable field ─── */
function EditableText({ value, onSave, multiline, placeholder, disabled, className }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft]     = useState(value);
  const ref = useRef(null);

  useEffect(() => { if (editing) ref.current?.focus(); }, [editing]);

  const commit = () => {
    setEditing(false);
    if (draft !== value) onSave(draft);
  };

  const cancel = () => { setDraft(value); setEditing(false); };

  if (!editing) {
    return (
      <div
        onClick={() => !disabled && setEditing(true)}
        className={cn(
          'group relative rounded-lg px-2 py-1 -mx-2 -my-1',
          !disabled && 'cursor-text hover:bg-gray-100 dark:hover:bg-gray-800/60',
          className,
        )}
      >
        {value || <span className="text-gray-400 dark:text-gray-600 italic text-sm">{placeholder}</span>}
        {!disabled && (
          <Pencil size={11} className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-40 text-gray-400 transition-opacity" />
        )}
      </div>
    );
  }

  return multiline ? (
    <div className="flex flex-col gap-1">
      <textarea
        ref={ref}
        value={draft}
        onChange={e => setDraft(e.target.value)}
        rows={4}
        className="w-full rounded-lg border border-indigo-300 dark:border-indigo-500 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 resize-none"
      />
      <div className="flex gap-1.5">
        <button onClick={commit} className="px-3 py-1 rounded-md bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-700 transition-colors">Save</button>
        <button onClick={cancel} className="px-3 py-1 rounded-md text-gray-500 text-xs hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">Cancel</button>
      </div>
    </div>
  ) : (
    <div className="flex items-center gap-1">
      <input
        ref={ref}
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') cancel(); }}
        className="flex-1 rounded-lg border border-indigo-300 dark:border-indigo-500 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
      />
      <button onClick={commit} className="w-7 h-7 rounded-lg flex items-center justify-center bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"><Check size={13} /></button>
      <button onClick={cancel} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"><X size={13} /></button>
    </div>
  );
}

/* ─── Comment ─── */
function CommentItem({ comment }) {
  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="flex gap-3">
      <Avatar user={comment.author} size="sm" />
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-xs font-semibold text-gray-900 dark:text-white">{comment.author?.name || 'Unknown'}</span>
          <span className="text-[10px] text-gray-400">{timeAgo(comment.createdAt)}</span>
        </div>
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{comment.text}</p>
      </div>
    </div>
  );
}

/* ─── Main Page ─── */
export default function TaskDetailPage() {
  const { projectId, taskId } = useParams();
  const navigate  = useNavigate();
  const { user }  = useAuth();
  const { success: toastSuccess, error: toastError } = useToast();

  const [task,       setTask]       = useState(null);
  const [project,    setProject]    = useState(null);
  const [allUsers,   setAllUsers]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [deleting,   setDeleting]   = useState(false);
  const [comment,    setComment]    = useState('');
  const [commenting, setCommenting] = useState(false);
  const commentRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const [taskRes, projRes, usersRes] = await Promise.all([
          tasksAPI.getById(projectId, taskId),
          projectsAPI.getById(projectId),
          usersAPI.getAll(),
        ]);
        if (cancelled) return;
        setTask(taskRes.data.task);
        setProject(projRes.data.project);
        setAllUsers(usersRes.data.users || []);
      } catch {
        if (!cancelled) navigate(-1);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [projectId, taskId, navigate]);

  /* ─── Permissions ─── */
  const projectRole = (() => {
    if (!user || !project) return null;
    if (user.systemRole === 'admin') return 'admin';
    const m = project.members?.find(m => (m.user?._id || m.user) === user.id);
    return m?.projectRole ?? null;
  })();
  const canEdit   = ['admin', 'project_manager', 'team_lead'].includes(projectRole);
  const canDelete = ['admin', 'project_manager', 'team_lead'].includes(projectRole);

  /* ─── Update helpers ─── */
  const update = async (fields) => {
    setSaving(true);
    try {
      const { data } = await tasksAPI.update(projectId, taskId, fields);
      setTask(data.task);
      toastSuccess('Task updated');
    } catch {
      toastError('Failed to update task');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this task? This cannot be undone.')) return;
    setDeleting(true);
    try {
      await tasksAPI.delete(projectId, taskId);
      toastSuccess('Task deleted');
      navigate(`/projects/${projectId}`);
    } catch {
      toastError('Failed to delete task');
      setDeleting(false);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setCommenting(true);
    try {
      const { data } = await tasksAPI.addComment(projectId, taskId, comment.trim());
      setTask(data.task);
      setComment('');
    } catch {
      toastError('Failed to post comment');
    } finally {
      setCommenting(false);
    }
  };

  /* ─── Loading ─── */
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-64">
        <Loader2 size={26} className="animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!task) return null;

  const statusObj   = STATUS_OPTIONS.find(s => s.value === task.status) || STATUS_OPTIONS[0];
  const priorityObj = PRIORITY_MAP[task.priority] || PRIORITY_MAP.medium;
  const PriorityIcon = priorityObj.icon;
  const assignedUser = allUsers.find(u => (u._id || u.id) === (task.assignedTo?._id || task.assignedTo));

  return (
    <div className="min-h-full bg-gray-50 dark:bg-gray-950">
      <div className="max-w-4xl mx-auto px-4 py-6">

        {/* Back nav */}
        <Link
          to={`/projects/${projectId}`}
          className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors mb-5"
        >
          <ArrowLeft size={15} />
          Back to {project?.name || 'Project'}
        </Link>

        <div className="grid lg:grid-cols-3 gap-5">

          {/* ── Main content ── */}
          <div className="lg:col-span-2 space-y-4">

            {/* Title card */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200/70 dark:border-gray-800 p-5">
              <div className="flex items-start gap-3 mb-4">
                <div className={cn('w-2.5 h-2.5 rounded-full shrink-0 mt-2', priorityObj.dot)} />
                <div className="flex-1 min-w-0">
                  <EditableText
                    value={task.title}
                    onSave={(v) => update({ title: v })}
                    disabled={!canEdit}
                    placeholder="Task title"
                    className="text-lg font-bold text-gray-900 dark:text-white leading-snug"
                  />
                </div>
                {saving && <Loader2 size={15} className="animate-spin text-indigo-400 shrink-0 mt-1" />}
                {canDelete && (
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
                    title="Delete task"
                  >
                    {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                  </button>
                )}
              </div>

              <div className="mb-4">
                <p className="text-xs font-medium text-gray-400 dark:text-gray-600 uppercase tracking-wider mb-2">Description</p>
                <EditableText
                  value={task.description}
                  onSave={(v) => update({ description: v })}
                  disabled={!canEdit}
                  multiline
                  placeholder="No description — click to add one"
                  className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed"
                />
              </div>

              {/* Tags */}
              {task.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {task.tags.map(tag => (
                    <span key={tag} className={cn('px-2 py-0.5 rounded-md text-xs font-medium', TAG_COLORS[tag] || 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400')}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Comments */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200/70 dark:border-gray-800 overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-100 dark:border-gray-800">
                <MessageSquare size={14} className="text-gray-400" />
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Comments <span className="text-gray-400 font-normal">({task.comments?.length || 0})</span>
                </h3>
              </div>

              <div className="p-5 space-y-5">
                {task.comments?.length === 0 && (
                  <p className="text-sm text-gray-400 dark:text-gray-600 text-center py-4">
                    No comments yet. Be the first to comment.
                  </p>
                )}
                {task.comments?.map((c, i) => (
                  <CommentItem key={c._id || i} comment={c} />
                ))}
              </div>

              {/* Add comment */}
              <div className="px-5 pb-5 border-t border-gray-100 dark:border-gray-800 pt-4">
                <div className="flex gap-3">
                  <Avatar user={user} size="sm" />
                  <form onSubmit={handleComment} className="flex-1 flex gap-2">
                    <textarea
                      ref={commentRef}
                      value={comment}
                      onChange={e => setComment(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleComment(e); } }}
                      placeholder="Add a comment… (Enter to send, Shift+Enter for newline)"
                      rows={2}
                      className="flex-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-300 dark:focus:border-indigo-600 resize-none transition-all"
                    />
                    <button
                      type="submit"
                      disabled={!comment.trim() || commenting}
                      className="self-end w-9 h-9 rounded-lg flex items-center justify-center bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                      {commenting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                    </button>
                  </form>
                </div>
              </div>
            </div>

          </div>

          {/* ── Sidebar metadata ── */}
          <div className="space-y-3">

            {/* Status */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200/70 dark:border-gray-800 p-4">
              <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-600 uppercase tracking-wider mb-2">Status</p>
              <select
                value={task.status}
                onChange={e => canEdit && update({ status: e.target.value })}
                disabled={!canEdit}
                className={cn(
                  'w-full rounded-lg px-3 py-2 text-sm font-medium border-0 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all cursor-pointer',
                  statusObj.color,
                  !canEdit && 'cursor-default opacity-80',
                )}
              >
                {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>

            {/* Priority */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200/70 dark:border-gray-800 p-4">
              <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-600 uppercase tracking-wider mb-2">Priority</p>
              <select
                value={task.priority}
                onChange={e => canEdit && update({ priority: e.target.value })}
                disabled={!canEdit}
                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all"
              >
                {PRIORITY_OPTIONS.map(p => <option key={p} value={p}>{PRIORITY_MAP[p].label}</option>)}
              </select>
            </div>

            {/* Assignee */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200/70 dark:border-gray-800 p-4">
              <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                <User size={10} /> Assigned to
              </p>
              {canEdit ? (
                <select
                  value={task.assignedTo?._id || task.assignedTo || ''}
                  onChange={e => update({ assignedTo: e.target.value || null })}
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all"
                >
                  <option value="">Unassigned</option>
                  {(project?.members || []).map(m => {
                    const u = m.user;
                    return <option key={u._id || u} value={u._id || u}>{u.name || u}</option>;
                  })}
                </select>
              ) : (
                <div className="flex items-center gap-2">
                  {task.assignedTo ? (
                    <>
                      <Avatar user={task.assignedTo} size="sm" />
                      <span className="text-sm text-gray-800 dark:text-gray-200">{task.assignedTo.name}</span>
                    </>
                  ) : (
                    <span className="text-sm text-gray-400">Unassigned</span>
                  )}
                </div>
              )}
            </div>

            {/* Due date */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200/70 dark:border-gray-800 p-4">
              <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Calendar size={10} /> Due date
              </p>
              <input
                type="date"
                value={task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''}
                onChange={e => canEdit && update({ dueDate: e.target.value || null })}
                disabled={!canEdit}
                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all disabled:opacity-70"
              />
              {task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done' && (
                <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle size={10} /> Overdue
                </p>
              )}
            </div>

            {/* Estimated time */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200/70 dark:border-gray-800 p-4">
              <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Timer size={10} /> Estimate
              </p>
              <EditableText
                value={task.estimatedTime}
                onSave={(v) => update({ estimatedTime: v })}
                disabled={!canEdit}
                placeholder="e.g. 3h, 2 days"
                className="text-sm text-gray-700 dark:text-gray-300"
              />
            </div>

            {/* Created by */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200/70 dark:border-gray-800 p-4">
              <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-600 uppercase tracking-wider mb-2">Created by</p>
              <div className="flex items-center gap-2">
                <Avatar user={task.createdBy} size="sm" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{task.createdBy?.name || 'Unknown'}</p>
                  <p className="text-[10px] text-gray-400">
                    {task.createdAt ? new Date(task.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                  </p>
                </div>
              </div>
            </div>

            {/* Project link */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200/70 dark:border-gray-800 p-4">
              <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-600 uppercase tracking-wider mb-2">Project</p>
              <Link
                to={`/projects/${projectId}`}
                className="flex items-center gap-2 group"
              >
                <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: project?.color || '#6366f1' }} />
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                  {project?.name || 'Project'}
                </span>
              </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

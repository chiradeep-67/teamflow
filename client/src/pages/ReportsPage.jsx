import { useState, useEffect } from 'react';
import {
  CheckCircle, Clock, Users, AlertTriangle, TrendingUp,
  Loader2, Calendar, BarChart2, MessageSquare, Copy, Check,
  ChevronDown, FolderKanban, Flame, AlertCircle, Circle,
} from 'lucide-react';
import { projectsAPI, tasksAPI } from '../services/api';
import { cn } from '../utils/cn';

/* ─── Helpers ─────────────────────────────────────────────────────────────── */
function workingDaysBetween(from, to) {
  let count = 0;
  const cur = new Date(from);
  cur.setHours(0, 0, 0, 0);
  const end = new Date(to);
  end.setHours(0, 0, 0, 0);
  while (cur <= end) {
    const d = cur.getDay();
    if (d !== 0 && d !== 6) count++;
    cur.setDate(cur.getDate() + 1);
  }
  return count;
}

function parseEstimateHours(str) {
  if (!str) return 0;
  let total = 0;
  const h = str.match(/(\d+\.?\d*)\s*h/i);
  const m = str.match(/(\d+)\s*m/i);
  if (h) total += parseFloat(h[1]);
  if (m) total += parseInt(m[1]) / 60;
  if (!h && !m) { const n = parseFloat(str); if (!isNaN(n)) total = n; }
  return total;
}

function fmtHrs(h) {
  if (!h) return '—';
  const hrs  = Math.floor(h);
  const mins = Math.round((h - hrs) * 60);
  return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
}

const PRIORITY_CONFIG = {
  urgent: { label: 'Urgent', color: '#ef4444', bg: 'bg-red-50 dark:bg-red-500/10',    text: 'text-red-600 dark:text-red-400',    icon: Flame },
  high:   { label: 'High',   color: '#f97316', bg: 'bg-orange-50 dark:bg-orange-500/10', text: 'text-orange-600 dark:text-orange-400', icon: AlertCircle },
  medium: { label: 'Medium', color: '#eab308', bg: 'bg-yellow-50 dark:bg-yellow-500/10', text: 'text-yellow-600 dark:text-yellow-400', icon: Circle },
  low:    { label: 'Low',    color: '#94a3b8', bg: 'bg-gray-50 dark:bg-gray-800',      text: 'text-gray-500 dark:text-gray-400',   icon: Circle },
};

const COLS_STATUS = ['todo', 'in_progress', 'in_review', 'done', 'cancelled'];
const STATUS_LABEL = { todo: 'To Do', in_progress: 'In Progress', in_review: 'In Review', done: 'Done', cancelled: 'Cancelled' };

/* ─── Mini bar chart (SVG) ───────────────────────────────────────────────── */
function BarChart({ data }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="flex items-end gap-1.5 h-20">
      {data.map((d, i) => (
        <div key={i} className="flex flex-col items-center flex-1 gap-1">
          <span className="text-[9px] font-semibold text-gray-600 dark:text-gray-400">{d.value || ''}</span>
          <div className="w-full rounded-t-sm transition-all" style={{ height: `${Math.max((d.value / max) * 60, d.value > 0 ? 4 : 0)}px`, backgroundColor: d.color }} />
          <span className="text-[9px] text-gray-400 dark:text-gray-600 text-center leading-tight">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

/* ─── Donut chart (SVG) ──────────────────────────────────────────────────── */
function DonutChart({ slices, size = 80 }) {
  const total = slices.reduce((s, x) => s + x.value, 0);
  if (!total) return <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs text-gray-400">No data</div>;
  const r = 30, cx = 40, cy = 40, stroke = 12;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  const arcs = slices.map(s => {
    const dash = (s.value / total) * circ;
    const arc = { ...s, dash, gap: circ - dash, offset };
    offset += dash;
    return arc;
  });
  return (
    <svg width={size} height={size} viewBox="0 0 80 80">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e5e7eb" strokeWidth={stroke} />
      {arcs.filter(a => a.value > 0).map((a, i) => (
        <circle key={i} cx={cx} cy={cy} r={r} fill="none"
          stroke={a.color} strokeWidth={stroke}
          strokeDasharray={`${a.dash} ${a.gap}`}
          strokeDashoffset={-a.offset}
          transform="rotate(-90 40 40)" />
      ))}
      <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="middle" fontSize="11" fontWeight="700" fill="currentColor" className="fill-gray-800 dark:fill-gray-200">
        {total}
      </text>
    </svg>
  );
}

/* ─── Progress ring ──────────────────────────────────────────────────────── */
function ProgressRing({ pct, color = '#6366f1', size = 60 }) {
  const r = 22, cx = 30, cy = 30;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} viewBox="0 0 60 60">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e5e7eb" strokeWidth={8} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={8}
        strokeDasharray={`${dash} ${circ - dash}`} strokeDashoffset={circ / 4}
        transform="rotate(180 30 30)" strokeLinecap="round" />
      <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="middle" fontSize="10" fontWeight="700" fill={color}>{pct}%</text>
    </svg>
  );
}

/* ─── Alert / Message Card ───────────────────────────────────────────────── */
function AlertCard({ project, tasks, members }) {
  const [copied, setCopied] = useState(false);
  const today = new Date();
  const deadline = project.dueDate ? new Date(project.dueDate) : null;
  const remainingDays = deadline ? workingDaysBetween(today, deadline) : null;
  const remainingHrs = remainingDays !== null ? remainingDays * 8 : null; // 8 hrs/day

  const activeTasks = tasks.filter(t => !['done', 'cancelled'].includes(t.status));
  const totalEstRemaining = activeTasks.reduce((s, t) => s + parseEstimateHours(t.estimatedTime), 0);
  const activeMembers = members.filter(m => m.projectRole !== 'project_manager');

  if (!deadline || activeMembers.length === 0 || activeTasks.length === 0) return null;

  const totalCapacity = activeMembers.length * (remainingDays ?? 0) * 8;
  const overload = totalEstRemaining > totalCapacity;
  const noEstimate = activeTasks.every(t => !t.estimatedTime);

  if (!overload && !noEstimate) return null;

  const weeksLeft = deadline ? Math.floor((deadline - today) / (7 * 24 * 3600 * 1000)) : 0;
  const message = `Hi, I'm reviewing the project "${project.name}".
We have ${activeTasks.length} tasks remaining with ~${fmtHrs(totalEstRemaining)} of estimated work.
Available capacity: ${activeMembers.length} member(s) × ${remainingDays} working days × 8hrs = ${fmtHrs(totalCapacity)}.
${overload ? `We are SHORT by ${fmtHrs(totalEstRemaining - totalCapacity)}. Can we add another member to ensure we finish by the deadline (${deadline.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })})?` : ''}
${weeksLeft > 0 ? `Deadline in ${weeksLeft} week${weeksLeft !== 1 ? 's' : ''} (${remainingDays} working days = ${fmtHrs(remainingHrs)}).` : 'Deadline is very close!'}`;

  const copy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn('rounded-xl border p-4', overload
      ? 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30'
      : 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30')}>
      <div className="flex items-start gap-3">
        <AlertTriangle size={16} className={overload ? 'text-red-500 shrink-0 mt-0.5' : 'text-amber-500 shrink-0 mt-0.5'} />
        <div className="flex-1 min-w-0">
          <p className={cn('text-sm font-semibold mb-1', overload ? 'text-red-700 dark:text-red-400' : 'text-amber-700 dark:text-amber-400')}>
            {overload ? '⚠ Project At Risk — Insufficient Capacity' : '⚠ Missing Estimates'}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
            {overload
              ? `${activeMembers.length} member${activeMembers.length !== 1 ? 's' : ''} with ${fmtHrs(totalCapacity)} capacity cannot finish ${fmtHrs(totalEstRemaining)} of remaining work before the deadline. Consider adding another member.`
              : 'Some tasks are missing time estimates, making capacity planning unreliable. Ask the TL to add estimated hours.'}
          </p>
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-3 text-xs text-gray-600 dark:text-gray-400 font-mono whitespace-pre-wrap mb-3">
            {message}
          </div>
          <button onClick={copy}
            className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
              copied
                ? 'bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400'
                : overload
                  ? 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 hover:bg-red-200'
                  : 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 hover:bg-amber-200')}>
            {copied ? <><Check size={11} />Copied to clipboard!</> : <><Copy size={11} /><MessageSquare size={11} />Copy message for TL</>}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Per-project report ─────────────────────────────────────────────────── */
function ProjectReport({ project, tasks }) {
  const today = new Date();
  const deadline = project.dueDate ? new Date(project.dueDate) : null;
  const remainingDays = deadline ? workingDaysBetween(today, deadline) : null;
  const weeksLeft = deadline ? Math.max(0, Math.floor((deadline - today) / (7 * 24 * 3600 * 1000))) : null;
  const remainingHrs = remainingDays !== null ? remainingDays * 8 : null;

  const totalTasks = tasks.length;
  const doneTasks  = tasks.filter(t => t.status === 'done').length;
  const pct        = totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const activeMembers = (project.members || []).filter(m => m.projectRole !== 'project_manager' && m.user);

  /* Priority breakdown */
  const byPriority = ['urgent', 'high', 'medium', 'low'].map(p => ({
    label: PRIORITY_CONFIG[p].label,
    value: tasks.filter(t => t.priority === p).length,
    color: PRIORITY_CONFIG[p].color,
  }));

  /* Status breakdown */
  const byStatus = COLS_STATUS.map(s => ({
    label: STATUS_LABEL[s],
    value: tasks.filter(t => t.status === s).length,
    color: s === 'done' ? '#22c55e' : s === 'in_progress' ? '#6366f1' : s === 'in_review' ? '#8b5cf6' : s === 'cancelled' ? '#ef4444' : '#94a3b8',
  }));

  /* Per-member workload */
  const memberStats = activeMembers.map(m => {
    const uid = m.user?._id || m.user;
    const name = m.user?.name || 'Unknown';
    const myTasks = tasks.filter(t => (t.assignedTo?._id || t.assignedTo) === uid);
    const myDone  = myTasks.filter(t => t.status === 'done');
    const myActive = myTasks.filter(t => !['done', 'cancelled'].includes(t.status));
    const estHrs  = myTasks.reduce((s, t) => s + parseEstimateHours(t.estimatedTime), 0);
    const doneHrs = myDone.reduce((s, t) => s + parseEstimateHours(t.estimatedTime), 0);
    return { uid, name, total: myTasks.length, done: myDone.length, active: myActive.length, estHrs, doneHrs, projectRole: m.projectRole };
  }).sort((a, b) => b.total - a.total);

  /* Done tasks log */
  const donelog = tasks
    .filter(t => t.status === 'done')
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

  const isPastDeadline = deadline && deadline < today;

  return (
    <div className="space-y-5">

      {/* ── Project health header ── */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200/70 dark:border-gray-800 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          <ProgressRing pct={pct} color={project.color || '#6366f1'} size={72} />
          <div className="flex-1 grid sm:grid-cols-3 gap-4">
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Team Members</p>
              <div className="flex items-center gap-1.5">
                <Users size={14} className="text-indigo-500" />
                <span className="text-xl font-bold text-gray-900 dark:text-white">{activeMembers.length}</span>
                <span className="text-xs text-gray-400">working</span>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Tasks</p>
              <div className="flex items-center gap-1.5">
                <CheckCircle size={14} className="text-green-500" />
                <span className="text-xl font-bold text-gray-900 dark:text-white">{doneTasks}</span>
                <span className="text-xs text-gray-400">/ {totalTasks} done</span>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Deadline</p>
              {deadline ? (
                <div>
                  <div className={cn('flex items-center gap-1.5', isPastDeadline ? 'text-red-500' : 'text-gray-900 dark:text-white')}>
                    <Calendar size={14} />
                    <span className="text-sm font-semibold">{deadline.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  {remainingDays !== null && (
                    <p className={cn('text-[11px] mt-0.5 font-medium', isPastDeadline ? 'text-red-500' : 'text-gray-500 dark:text-gray-400')}>
                      {isPastDeadline
                        ? `Overdue by ${Math.abs(remainingDays)} working days`
                        : `${weeksLeft > 0 ? `${weeksLeft}w · ` : ''}${remainingDays} working days · ~${fmtHrs(remainingHrs)}`}
                    </p>
                  )}
                </div>
              ) : (
                <span className="text-xs text-gray-400">No deadline set</span>
              )}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Overall Progress</span>
            <span className="text-xs font-semibold text-gray-900 dark:text-white">{pct}%</span>
          </div>
          <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: project.color || '#6366f1' }} />
          </div>
        </div>
      </div>

      {/* ── Smart Alert ── */}
      <AlertCard project={project} tasks={tasks} members={project.members || []} />

      {/* ── Charts row ── */}
      <div className="grid sm:grid-cols-2 gap-5">

        {/* Priority breakdown */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200/70 dark:border-gray-800 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Flame size={14} className="text-red-500" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Tasks by Priority</h3>
          </div>
          <div className="flex items-end gap-6">
            <BarChart data={byPriority} />
            <div className="space-y-2 shrink-0">
              {byPriority.map(p => (
                <div key={p.label} className="flex items-center gap-2 text-xs">
                  <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: p.color }} />
                  <span className="text-gray-600 dark:text-gray-400">{p.label}</span>
                  <span className="font-semibold text-gray-900 dark:text-white ml-auto pl-3">{p.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Status donut */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200/70 dark:border-gray-800 p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 size={14} className="text-indigo-500" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Tasks by Status</h3>
          </div>
          <div className="flex items-center gap-5">
            <DonutChart slices={byStatus.filter(s => s.value > 0)} size={80} />
            <div className="space-y-2 flex-1">
              {byStatus.filter(s => s.value > 0).map(s => (
                <div key={s.label} className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                  <span className="text-gray-600 dark:text-gray-400 flex-1 truncate">{s.label}</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Team workload ── */}
      {memberStats.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200/70 dark:border-gray-800 overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100 dark:border-gray-800">
            <Users size={14} className="text-indigo-500" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Team Workload</h3>
            <span className="ml-auto text-xs text-gray-400">{activeMembers.length} member{activeMembers.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                  <th className="text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-5 py-3">Member</th>
                  <th className="text-center text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3 py-3">Assigned</th>
                  <th className="text-center text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3 py-3">Done</th>
                  <th className="text-center text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3 py-3">Active</th>
                  <th className="text-center text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3 py-3">Est. Hrs</th>
                  <th className="text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-5 py-3 min-w-[160px]">Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {memberStats.map(m => {
                  const pct2 = m.total ? Math.round((m.done / m.total) * 100) : 0;
                  const initials = m.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                  return (
                    <tr key={m.uid} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-indigo-500 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                            {initials}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800 dark:text-gray-200">{m.name}</p>
                            <p className="text-[10px] text-gray-400 capitalize">{m.projectRole?.replace('_', ' ')}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-center font-semibold text-gray-900 dark:text-white">{m.total}</td>
                      <td className="px-3 py-3 text-center">
                        <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400 font-semibold">
                          <CheckCircle size={10} />{m.done}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className={cn('font-semibold', m.active > 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400')}>
                          {m.active}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center">
                        {m.estHrs > 0 ? (
                          <span className="inline-flex items-center gap-1 text-violet-600 dark:text-violet-400 font-medium bg-violet-50 dark:bg-violet-500/10 px-2 py-0.5 rounded-md">
                            <Clock size={9} />{fmtHrs(m.estHrs)}
                          </span>
                        ) : <span className="text-gray-400">—</span>}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                            <div className="h-full rounded-full bg-green-500 transition-all duration-500" style={{ width: `${pct2}%` }} />
                          </div>
                          <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 w-8 text-right">{pct2}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Completed tasks log ── */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200/70 dark:border-gray-800 overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <CheckCircle size={14} className="text-green-500" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Completed Tasks</h3>
          <span className="ml-auto text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md">{donelog.length} done</span>
        </div>
        {donelog.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <CheckCircle size={24} className="text-gray-300 dark:text-gray-700 mb-2" />
            <p className="text-sm text-gray-400 dark:text-gray-600">No completed tasks yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                  <th className="text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-5 py-3">Task</th>
                  <th className="text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-4 py-3">Done by</th>
                  <th className="text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-4 py-3">Priority</th>
                  <th className="text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-4 py-3">Est. Time</th>
                  <th className="text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-4 py-3">Completed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {donelog.map(task => {
                  const PC = PRIORITY_CONFIG[task.priority] ?? PRIORITY_CONFIG.medium;
                  return (
                    <tr key={task._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <CheckCircle size={11} className="text-green-500 shrink-0" />
                          <span className="font-medium text-gray-600 dark:text-gray-400 line-through truncate max-w-[200px]">{task.title}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {task.assignedTo ? (
                          <div className="flex items-center gap-1.5">
                            <div className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center text-white text-[9px] font-bold shrink-0">
                              {(task.assignedTo.name || '?').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                            </div>
                            <span className="text-gray-600 dark:text-gray-400">{task.assignedTo.name?.split(' ')[0]}</span>
                          </div>
                        ) : <span className="text-gray-400">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn('inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium', PC.bg, PC.text)}>
                          <PC.icon size={9} />{PC.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {task.estimatedTime
                          ? <span className="text-violet-600 dark:text-violet-400 font-medium">{task.estimatedTime}</span>
                          : <span className="text-gray-400">—</span>}
                      </td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                        {task.updatedAt ? new Date(task.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Main Reports Page ──────────────────────────────────────────────────── */
export default function ReportsPage() {
  const [projects,     setProjects]     = useState([]);
  const [tasksByProj,  setTasksByProj]  = useState({});
  const [loading,      setLoading]      = useState(true);
  const [selectedProj, setSelectedProj] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const { data } = await projectsAPI.getAll();
        const list = data.projects || [];
        if (cancelled) return;
        setProjects(list);
        if (list.length > 0) setSelectedProj(list[0]._id);

        const results = await Promise.allSettled(
          list.map(p => tasksAPI.getByProject(p._id).then(r => ({ id: p._id, tasks: r.data.tasks || [] })))
        );
        if (cancelled) return;
        const map = {};
        results.filter(r => r.status === 'fulfilled').forEach(r => { map[r.value.id] = r.value.tasks; });
        setTasksByProj(map);
      } catch { /* silent */ }
      finally { if (!cancelled) setLoading(false); }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const currentProject = projects.find(p => p._id === selectedProj);
  const currentTasks   = tasksByProj[selectedProj] || [];

  /* Summary stats across all projects */
  const allTasks  = Object.values(tasksByProj).flat();
  const totalDone = allTasks.filter(t => t.status === 'done').length;
  const totalPct  = allTasks.length ? Math.round((totalDone / allTasks.length) * 100) : 0;
  const overdue   = allTasks.filter(t => t.status !== 'done' && t.dueDate && new Date(t.dueDate) < new Date()).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={24} className="animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Project Reports</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Capacity planning, team workload and deadline tracking
          </p>
        </div>

        {/* Project selector */}
        {projects.length > 1 && (
          <div className="relative">
            <FolderKanban size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              value={selectedProj || ''}
              onChange={e => setSelectedProj(e.target.value)}
              className="h-9 pl-8 pr-8 rounded-lg text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all appearance-none cursor-pointer"
            >
              {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
            </select>
            <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        )}
      </div>

      {/* Cross-project summary stats */}
      {projects.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Projects',  value: projects.length,   sub: 'in your workspace',          icon: FolderKanban, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
            { label: 'Tasks Completed', value: totalDone,          sub: `of ${allTasks.length} total`, icon: CheckCircle,  color: 'text-green-500',  bg: 'bg-green-50 dark:bg-green-500/10' },
            { label: 'Completion Rate', value: `${totalPct}%`,     sub: 'across all projects',        icon: TrendingUp,   color: 'text-violet-500', bg: 'bg-violet-50 dark:bg-violet-500/10' },
            { label: 'Overdue Tasks',   value: overdue,            sub: overdue > 0 ? 'need attention' : 'all on track', icon: AlertTriangle, color: overdue > 0 ? 'text-red-500' : 'text-green-500', bg: overdue > 0 ? 'bg-red-50 dark:bg-red-500/10' : 'bg-green-50 dark:bg-green-500/10' },
          ].map(s => (
            <div key={s.label} className="p-5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200/70 dark:border-gray-800">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{s.label}</p>
                <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center', s.bg)}>
                  <s.icon size={13} className={s.color} />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{s.value}</p>
              <p className="text-xs text-gray-400 dark:text-gray-600 mt-0.5">{s.sub}</p>
            </div>
          ))}
        </div>
      )}

      {/* Per-project detailed report */}
      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl">
          <FolderKanban size={28} className="text-gray-300 dark:text-gray-700 mb-2" />
          <p className="text-sm text-gray-500 dark:text-gray-400">No projects yet — create one from the Board</p>
        </div>
      ) : currentProject ? (
        <>
          {projects.length > 1 && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: currentProject.color || '#6366f1' }} />
              <h2 className="text-base font-bold text-gray-900 dark:text-white">{currentProject.name}</h2>
              <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md">{currentTasks.length} tasks</span>
            </div>
          )}
          <ProjectReport project={currentProject} tasks={currentTasks} />
        </>
      ) : null}
    </div>
  );
}

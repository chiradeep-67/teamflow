import { useState, useEffect } from 'react';
import { CheckCircle, Clock, FolderKanban, Users, TrendingUp, Loader2, AlertCircle } from 'lucide-react';
import { projectsAPI, tasksAPI } from '../services/api';
import { cn } from '../utils/cn';

const PRIORITY_DOT = {
  urgent: 'bg-red-500',
  high:   'bg-orange-400',
  medium: 'bg-yellow-400',
  low:    'bg-gray-300 dark:bg-gray-600',
};

function StatCard({ icon: Icon, label, value, sub, color, bg }) {
  return (
    <div className="p-5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200/70 dark:border-gray-800">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{label}</p>
        <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center', bg)}>
          <Icon size={13} className={color} />
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      <p className="text-xs text-gray-400 dark:text-gray-600 mt-0.5">{sub}</p>
    </div>
  );
}

function Avatar({ name = '' }) {
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
  return (
    <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-white text-[10px] font-semibold shrink-0">
      {initials}
    </div>
  );
}

export default function ReportsPage() {
  const [projects, setProjects] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const { data } = await projectsAPI.getAll();
        const list = data.projects || [];
        if (cancelled) return;
        setProjects(list);

        const results = await Promise.allSettled(
          list.map(p => tasksAPI.getByProject(p._id).then(r => ({
            tasks: r.data.tasks || [],
            project: p,
          })))
        );
        if (cancelled) return;

        const flat = results
          .filter(r => r.status === 'fulfilled')
          .flatMap(r => r.value.tasks.map(t => ({ ...t, _projectObj: r.value.project })));
        setAllTasks(flat);
      } catch { /* silent */ }
      finally { if (!cancelled) setLoading(false); }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const doneTasks      = allTasks.filter(t => t.status === 'done');
  const withEstimate   = doneTasks.filter(t => t.estimatedTime);
  const totalTasks     = allTasks.length;
  const cancelledTasks = allTasks.filter(t => t.status === 'cancelled');
  const pct            = totalTasks ? Math.round((doneTasks.length / totalTasks) * 100) : 0;

  /* Group done tasks by project for the bar chart section */
  const byProject = projects.map(p => {
    const projectTasks = allTasks.filter(t => (t.project?._id || t.project) === p._id || t._projectObj?._id === p._id);
    const done         = projectTasks.filter(t => t.status === 'done').length;
    const total        = projectTasks.length;
    return { project: p, done, total, pct: total ? Math.round((done / total) * 100) : 0 };
  }).filter(x => x.total > 0);

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
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Reports</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Task completion and time overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={CheckCircle}  label="Tasks Done"       value={doneTasks.length}   sub={`of ${totalTasks} total`}       color="text-green-500"  bg="bg-green-50 dark:bg-green-500/10" />
        <StatCard icon={TrendingUp}   label="Completion Rate"  value={`${pct}%`}           sub="across all projects"            color="text-indigo-500" bg="bg-indigo-50 dark:bg-indigo-500/10" />
        <StatCard icon={Clock}        label="With Time Estimate" value={withEstimate.length} sub="done tasks have estimate"     color="text-violet-500" bg="bg-violet-50 dark:bg-violet-500/10" />
        <StatCard icon={AlertCircle}  label="Cancelled"        value={cancelledTasks.length} sub="tasks cancelled"             color="text-red-500"    bg="bg-red-50 dark:bg-red-500/10" />
      </div>

      {/* Project completion bars */}
      {byProject.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200/70 dark:border-gray-800 overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100 dark:border-gray-800">
            <FolderKanban size={14} className="text-gray-400" />
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Completion by Project</h2>
          </div>
          <div className="p-5 space-y-4">
            {byProject.map(({ project, done, total, pct: p }) => (
              <div key={project._id}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: project.color || '#6366f1' }} />
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate max-w-[180px]">{project.name}</span>
                  </div>
                  <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0 ml-3">{done}/{total} tasks · {p}%</span>
                </div>
                <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${p}%`, backgroundColor: project.color || '#6366f1' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Done tasks with estimated time */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200/70 dark:border-gray-800 overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <Clock size={14} className="text-gray-400" />
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Completed Tasks — Time Breakdown</h2>
          <span className="ml-auto text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md">{doneTasks.length} done</span>
        </div>

        {doneTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <CheckCircle size={28} className="text-gray-300 dark:text-gray-700 mb-2" />
            <p className="text-sm text-gray-400 dark:text-gray-600">No completed tasks yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  <th className="text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-5 py-3">Task</th>
                  <th className="text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-4 py-3">Project</th>
                  <th className="text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-4 py-3">Assigned To</th>
                  <th className="text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-4 py-3">Priority</th>
                  <th className="text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-4 py-3">Est. Time</th>
                  <th className="text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-4 py-3">Completed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {doneTasks.map(task => (
                  <tr key={task._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle size={12} className="text-green-500 shrink-0" />
                        <span className="font-medium text-gray-800 dark:text-gray-200 line-through opacity-70 truncate max-w-[200px]">
                          {task.title}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: task._projectObj?.color || '#6366f1' }} />
                        <span className="text-gray-500 dark:text-gray-400 truncate max-w-[120px]">
                          {task._projectObj?.name || '—'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {task.assignedTo ? (
                        <div className="flex items-center gap-1.5">
                          <Avatar name={task.assignedTo.name || ''} />
                          <span className="text-gray-600 dark:text-gray-400">{task.assignedTo.name?.split(' ')[0] || '—'}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <div className={cn('w-2 h-2 rounded-full shrink-0', PRIORITY_DOT[task.priority] ?? PRIORITY_DOT.medium)} />
                        <span className="text-gray-500 dark:text-gray-400 capitalize">{task.priority}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {task.estimatedTime ? (
                        <span className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-medium bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded-md">
                          <Clock size={10} />
                          {task.estimatedTime}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                      {task.updatedAt
                        ? new Date(task.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

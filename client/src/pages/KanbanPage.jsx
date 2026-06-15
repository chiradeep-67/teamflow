import { useState, useRef } from 'react';
import {
  Plus, MoreHorizontal, Flame, AlertCircle, Circle,
  Clock, Filter, Search, ChevronDown,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { cn } from '../utils/cn';

/* ─── Data ─── */
const INITIAL_COLS = [
  {
    id: 'backlog', title: 'Backlog', color: '#94a3b8',
    cards: [
      { id: 't1', title: 'API rate limiting strategy', desc: 'Research and implement rate limiting for public API endpoints.', tag: 'Backend', assignee: 'TK', priority: 'low', due: 'Jul 5' },
      { id: 't2', title: 'Update design tokens', desc: 'Sync Figma tokens with codebase and update component library.', tag: 'Design', assignee: 'SC', priority: 'medium', due: 'Jul 8' },
    ],
  },
  {
    id: 'todo', title: 'To Do', color: '#6366f1',
    cards: [
      { id: 't3', title: 'Write API documentation', desc: 'Complete OpenAPI spec for all v2 endpoints with examples.', tag: 'Docs', assignee: 'SC', priority: 'medium', due: 'Jun 20' },
      { id: 't4', title: 'Set up CI/CD pipeline', desc: 'Configure GitHub Actions for automated testing and deployment.', tag: 'DevOps', assignee: 'TK', priority: 'high', due: 'Jun 17' },
      { id: 't5', title: 'Landing page A/B test', desc: 'Set up experiment for hero headline variants.', tag: 'Marketing', assignee: 'AJ', priority: 'low', due: 'Jun 25' },
    ],
  },
  {
    id: 'in_progress', title: 'In Progress', color: '#8b5cf6',
    cards: [
      { id: 't6', title: 'Onboarding flow v2', desc: 'Redesign new user onboarding with interactive product tour.', tag: 'Product', assignee: 'MR', priority: 'high', due: 'Jun 16' },
      { id: 't7', title: 'Auth token refresh', desc: 'Fix silent token refresh issue causing session drops.', tag: 'Backend', assignee: 'TK', priority: 'urgent', due: 'Today' },
      { id: 't8', title: 'Dashboard analytics', desc: 'Implement charts for team velocity and burndown metrics.', tag: 'Frontend', assignee: 'AJ', priority: 'high', due: 'Jun 18' },
    ],
  },
  {
    id: 'in_review', title: 'In Review', color: '#ec4899',
    cards: [
      { id: 't9', title: 'CI/CD pipeline fixes', desc: 'Resolve flaky test runner and optimize build times.', tag: 'DevOps', assignee: 'SC', priority: 'medium', due: 'Jun 15' },
      { id: 't10', title: 'Mobile responsive fixes', desc: 'Fix layout breakpoints on tablets and small screens.', tag: 'Frontend', assignee: 'MR', priority: 'high', due: 'Jun 16' },
    ],
  },
  {
    id: 'done', title: 'Done', color: '#22c55e',
    cards: [
      { id: 't11', title: 'User profile page', desc: 'Complete profile with avatar upload and notification settings.', tag: 'Frontend', assignee: 'TK', priority: 'low', due: 'Jun 14' },
      { id: 't12', title: 'Email notifications', desc: 'Set up transactional emails for task assignments and mentions.', tag: 'Backend', assignee: 'AJ', priority: 'medium', due: 'Jun 12' },
    ],
  },
];

const PRIORITY_CONFIG = {
  urgent: { icon: Flame, cls: 'text-red-500', label: 'Urgent' },
  high: { icon: AlertCircle, cls: 'text-orange-500', label: 'High' },
  medium: { icon: Circle, cls: 'text-yellow-500', label: 'Medium' },
  low: { icon: Circle, cls: 'text-gray-300 dark:text-gray-600', label: 'Low' },
};

const TAG_COLORS = {
  Backend: 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
  Frontend: 'bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400',
  Design: 'bg-pink-50 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400',
  DevOps: 'bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400',
  Product: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400',
  Docs: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400',
  Marketing: 'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400',
};

const AVATAR_COLORS = {
  AJ: 'from-indigo-500 to-violet-600',
  SC: 'from-teal-500 to-cyan-600',
  MR: 'from-rose-500 to-pink-600',
  TK: 'from-amber-500 to-orange-500',
};

/* ─── Task Card ─── */
function TaskCard({ card, colId, onDragStart, onOpenTask }) {
  const P = PRIORITY_CONFIG[card.priority];
  const tagCls = TAG_COLORS[card.tag] ?? 'bg-gray-100 dark:bg-gray-700 text-gray-500';

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, card.id, colId)}
      onClick={() => onOpenTask(card)}
      className={cn(
        'group bg-white dark:bg-gray-800 rounded-xl border border-gray-200/70 dark:border-gray-700/50',
        'p-3.5 cursor-grab active:cursor-grabbing select-none',
        'hover:border-indigo-200 dark:hover:border-indigo-500/40',
        'hover:shadow-sm transition-all duration-150',
        'animate-fade-in',
      )}
    >
      {/* Tag + priority row */}
      <div className="flex items-center justify-between mb-2.5">
        <span className={cn('text-[10px] font-semibold px-1.5 py-0.5 rounded-md', tagCls)}>{card.tag}</span>
        <P.icon size={13} className={P.cls} />
      </div>

      {/* Title */}
      <p className="text-sm font-medium text-gray-800 dark:text-gray-200 leading-snug mb-1.5">{card.title}</p>
      {card.desc && (
        <p className="text-xs text-gray-400 dark:text-gray-600 leading-relaxed mb-3 line-clamp-2">{card.desc}</p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-[10px] text-gray-400 dark:text-gray-600">
          <Clock size={10} />
          <span>{card.due}</span>
        </div>
        <div className={cn('w-5 h-5 rounded-full text-[9px] font-bold text-white flex items-center justify-center bg-gradient-to-br', AVATAR_COLORS[card.assignee] ?? 'from-gray-400 to-gray-600')}>
          {card.assignee[0]}
        </div>
      </div>
    </div>
  );
}

/* ─── Add Card inline form ─── */
function AddCard({ onAdd, onCancel }) {
  const [title, setTitle] = useState('');
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd(title.trim());
  };
  return (
    <form onSubmit={handleSubmit} className="mt-2">
      <textarea
        autoFocus
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Task title…"
        rows={2}
        className="w-full rounded-xl bg-white dark:bg-gray-800 border border-indigo-300 dark:border-indigo-500/50 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
        onKeyDown={e => { if (e.key === 'Escape') onCancel(); }}
      />
      <div className="flex gap-2 mt-2">
        <Button type="submit" size="sm">Add</Button>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}

/* ─── Column ─── */
function KanbanColumn({ col, onDragStart, onDragOver, onDrop, onOpenTask, onAddCard }) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [addingCard, setAddingCard] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
    onDragOver(e, col.id);
  };
  const handleDragLeave = () => setIsDragOver(false);
  const handleDrop = (e) => {
    setIsDragOver(false);
    onDrop(e, col.id);
  };

  return (
    <div className="flex flex-col w-64 shrink-0">
      {/* Column header */}
      <div className="flex items-center justify-between mb-3 px-0.5">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: col.color }} />
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{col.title}</span>
          <span className="text-xs text-gray-400 dark:text-gray-600 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded-md font-medium">
            {col.cards.length}
          </span>
        </div>
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => setAddingCard(true)}
            className="w-6 h-6 rounded-md flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <Plus size={13} />
          </button>
          <button className="w-6 h-6 rounded-md flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <MoreHorizontal size={13} />
          </button>
        </div>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'flex-1 flex flex-col gap-2.5 rounded-xl p-2.5 min-h-[200px] transition-all duration-150',
          isDragOver
            ? 'bg-indigo-50/60 dark:bg-indigo-500/5 border-2 border-dashed border-indigo-300 dark:border-indigo-500/40'
            : 'bg-gray-50/60 dark:bg-gray-900/30 border-2 border-transparent'
        )}
      >
        {col.cards.map(card => (
          <TaskCard
            key={card.id}
            card={card}
            colId={col.id}
            onDragStart={onDragStart}
            onOpenTask={onOpenTask}
          />
        ))}

        {addingCard && (
          <AddCard
            onAdd={(title) => { onAddCard(col.id, title); setAddingCard(false); }}
            onCancel={() => setAddingCard(false)}
          />
        )}

        {!addingCard && col.cards.length === 0 && (
          <button
            onClick={() => setAddingCard(true)}
            className="flex items-center justify-center gap-1.5 w-full py-4 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700 text-xs text-gray-400 dark:text-gray-600 hover:border-indigo-300 dark:hover:border-indigo-500/40 hover:text-indigo-500 dark:hover:text-indigo-400 transition-all"
          >
            <Plus size={12} /> Add task
          </button>
        )}
      </div>
    </div>
  );
}

/* ─── Task Detail Panel ─── */
function TaskPanel({ task, onClose }) {
  const P = PRIORITY_CONFIG[task.priority];
  const tagCls = TAG_COLORS[task.tag] ?? 'bg-gray-100 dark:bg-gray-700 text-gray-500';

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 bg-black/30 dark:bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 h-full overflow-y-auto animate-slide-up shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900 z-10">
          <div className="flex items-center gap-2">
            <span className={cn('text-[10px] font-semibold px-1.5 py-0.5 rounded-md', tagCls)}>{task.tag}</span>
            <P.icon size={13} className={P.cls} />
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            ×
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{task.title}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{task.desc}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Assignee', value: task.assignee },
              { label: 'Priority', value: P.label },
              { label: 'Due date', value: task.due },
              { label: 'Status', value: 'In Progress' },
            ].map(d => (
              <div key={d.label}>
                <p className="text-xs font-medium text-gray-400 dark:text-gray-600 mb-1">{d.label}</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{d.value}</p>
              </div>
            ))}
          </div>

          <div>
            <p className="text-xs font-medium text-gray-400 dark:text-gray-600 mb-3">Activity</p>
            <div className="space-y-3">
              {[
                { user: 'AJ', text: 'Created this task', time: '2h ago' },
                { user: 'MR', text: 'Added a comment: "Working on this now, should be done by EOD"', time: '1h ago' },
                { user: 'TK', text: 'Changed priority to High', time: '45m ago' },
              ].map((a, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={cn('w-6 h-6 rounded-full text-[10px] font-semibold text-white flex items-center justify-center bg-gradient-to-br shrink-0', AVATAR_COLORS[a.user] ?? 'from-gray-400 to-gray-600')}>
                    {a.user[0]}
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{a.text}</p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-600 mt-0.5">{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Comment box */}
          <div>
            <textarea
              placeholder="Add a comment…"
              rows={3}
              className="w-full rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-600 px-3.5 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
            />
            <div className="flex justify-end mt-2">
              <Button size="sm">Comment</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Page ─── */
export default function KanbanPage() {
  const [cols, setCols] = useState(INITIAL_COLS);
  const [activeTask, setActiveTask] = useState(null);
  const [search, setSearch] = useState('');
  const dragging = useRef({ cardId: null, fromCol: null });

  const handleDragStart = (e, cardId, colId) => {
    dragging.current = { cardId, fromCol: colId };
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = (e, toColId) => {
    e.preventDefault();
    const { cardId, fromCol } = dragging.current;
    if (!cardId || fromCol === toColId) return;

    setCols(prev => {
      const from = prev.find(c => c.id === fromCol);
      const card = from?.cards.find(c => c.id === cardId);
      if (!card) return prev;
      return prev.map(col => {
        if (col.id === fromCol) return { ...col, cards: col.cards.filter(c => c.id !== cardId) };
        if (col.id === toColId) return { ...col, cards: [...col.cards, card] };
        return col;
      });
    });
    dragging.current = { cardId: null, fromCol: null };
  };

  const handleAddCard = (colId, title) => {
    const newCard = {
      id: `t${Date.now()}`, title, desc: '', tag: 'General',
      assignee: 'AJ', priority: 'medium', due: 'TBD',
    };
    setCols(prev => prev.map(col => col.id === colId ? { ...col, cards: [...col.cards, newCard] } : col));
  };

  const filteredCols = search
    ? cols.map(col => ({ ...col, cards: col.cards.filter(c => c.title.toLowerCase().includes(search.toLowerCase())) }))
    : cols;

  const totalCards = cols.reduce((a, c) => a + c.cards.length, 0);
  const doneCards = cols.find(c => c.id === 'done')?.cards.length ?? 0;

  return (
    <main className="flex flex-col h-[calc(100vh-56px)] overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 py-3.5 border-b border-gray-200/60 dark:border-gray-800/60 bg-white dark:bg-gray-950 shrink-0">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-sm font-semibold text-gray-900 dark:text-white">Sprint 12 Board</h1>
            <p className="text-xs text-gray-400 dark:text-gray-600">{doneCards}/{totalCards} tasks completed</p>
          </div>
          {/* Progress */}
          <div className="hidden sm:flex items-center gap-2 w-32">
            <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${totalCards ? Math.round((doneCards / totalCards) * 100) : 0}%` }} />
            </div>
            <span className="text-xs text-gray-400 dark:text-gray-600">{totalCards ? Math.round((doneCards / totalCards) * 100) : 0}%</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search tasks…"
              className="h-8 pl-8 pr-3 rounded-lg text-xs bg-gray-100 dark:bg-gray-800 border border-transparent focus:border-indigo-300 dark:focus:border-indigo-500/50 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none w-36 sm:w-48 transition-all"
            />
          </div>
          <button className="h-8 px-3 flex items-center gap-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <Filter size={12} /> Filter <ChevronDown size={11} />
          </button>
          <Button size="sm" leftIcon={<Plus size={13} />}>Add task</Button>
        </div>
      </div>

      {/* Board */}
      <div className="flex-1 overflow-x-auto overflow-y-auto">
        <div className="flex gap-4 p-6 min-w-max min-h-full items-start">
          {filteredCols.map(col => (
            <KanbanColumn
              key={col.id}
              col={col}
              onDragStart={handleDragStart}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onOpenTask={setActiveTask}
              onAddCard={handleAddCard}
            />
          ))}
        </div>
      </div>

      {activeTask && <TaskPanel task={activeTask} onClose={() => setActiveTask(null)} />}
    </main>
  );
}

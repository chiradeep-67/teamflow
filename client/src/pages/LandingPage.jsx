import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, LayoutGrid, UserCheck, ShieldCheck,
  BarChart3, CheckCircle, ChevronRight, Zap, Globe2,
  Clock, Users, TrendingUp, Star,
} from 'lucide-react';
import { LandingNavbar } from '../components/layout/LandingNavbar';
import { Footer } from '../components/layout/Footer';
import { ROUTES } from '../utils/constants';
import { cn } from '../utils/cn';

/* ─────────────────────────── HERO ─────────────────────────── */

function KanbanPreview() {
  const COLS = [
    {
      title: 'Backlog', color: 'bg-gray-400', cards: [
        { title: 'API rate limiting', tag: 'Backend', avatar: 'AJ', priority: 'low' },
        { title: 'Update design tokens', tag: 'Design', avatar: 'SC', priority: 'medium' },
      ],
    },
    {
      title: 'In Progress', color: 'bg-indigo-500', cards: [
        { title: 'Onboarding flow v2', tag: 'Product', avatar: 'MR', priority: 'high' },
        { title: 'Auth token refresh', tag: 'Backend', avatar: 'TK', priority: 'urgent' },
        { title: 'Dashboard analytics', tag: 'Frontend', avatar: 'AJ', priority: 'high' },
      ],
    },
    {
      title: 'In Review', color: 'bg-violet-500', cards: [
        { title: 'CI/CD pipeline', tag: 'DevOps', avatar: 'SC', priority: 'medium' },
        { title: 'Mobile responsiveness', tag: 'Frontend', avatar: 'MR', priority: 'high' },
      ],
    },
    {
      title: 'Done', color: 'bg-green-500', cards: [
        { title: 'User profile page', tag: 'Frontend', avatar: 'TK', priority: 'low' },
        { title: 'Email notifications', tag: 'Backend', avatar: 'AJ', priority: 'medium' },
      ],
    },
  ];

  const PRIORITY_DOT = { urgent: 'bg-red-500', high: 'bg-orange-400', medium: 'bg-yellow-400', low: 'bg-gray-300' };
  const AVATARS = { AJ: 'from-indigo-500 to-violet-600', SC: 'from-teal-500 to-cyan-600', MR: 'from-rose-500 to-pink-600', TK: 'from-amber-500 to-orange-500' };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-gray-200/70 dark:border-gray-800 bg-white dark:bg-gray-900">
      {/* App chrome bar */}
      <div className="flex items-center gap-1.5 px-4 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-900">
        <div className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
        <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/70" />
        <div className="w-2.5 h-2.5 rounded-full bg-green-400/70" />
        <span className="ml-3 text-xs text-gray-400 dark:text-gray-600 font-medium">TeamFlow — Sprint 12</span>
      </div>

      <div className="p-4 overflow-x-auto">
        <div className="flex gap-3 min-w-max">
          {COLS.map(col => (
            <div key={col.title} className="w-44">
              <div className="flex items-center gap-2 mb-2.5 px-0.5">
                <div className={cn('w-2 h-2 rounded-full', col.color)} />
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">{col.title}</span>
                <span className="ml-auto text-xs text-gray-300 dark:text-gray-700">{col.cards.length}</span>
              </div>
              <div className="space-y-2">
                {col.cards.map(card => (
                  <div
                    key={card.title}
                    className="p-2.5 rounded-lg bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700/50 hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-colors cursor-pointer"
                  >
                    <p className="text-[11px] font-medium text-gray-800 dark:text-gray-200 leading-snug mb-2">{card.title}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-gray-400 dark:text-gray-600 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">{card.tag}</span>
                      <div className="flex items-center gap-1.5">
                        <div className={cn('w-1.5 h-1.5 rounded-full', PRIORITY_DOT[card.priority])} />
                        <div className={cn('w-4 h-4 rounded-full text-[8px] font-bold text-white flex items-center justify-center bg-gradient-to-br', AVATARS[card.avatar])}>
                          {card.avatar[0]}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-24 pb-16 px-5 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-white dark:bg-gray-950" />
      <div
        className="absolute inset-0 opacity-[0.035] dark:opacity-[0.04]"
        style={{
          backgroundImage: `radial-gradient(circle, #6366f1 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
        }}
      />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-indigo-500/10 dark:bg-indigo-500/8 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200/60 dark:border-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-xs font-semibold px-3.5 py-1.5 rounded-full mb-8">
          <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
          Now in public beta — free for all teams
          <ChevronRight size={13} />
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900 dark:text-white leading-[1.08] mb-6">
          The simplest way for<br className="hidden sm:block" />
          <span className="relative">
            <span className="text-indigo-600 dark:text-indigo-400"> teams to manage</span>
          </span>
          <br className="hidden sm:block" />
          projects and tasks
        </h1>

        <p className="text-lg sm:text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Built for real teams. Trusted by fast-moving companies.<br className="hidden sm:block" />
          Kanban boards, sprints, roles, and analytics — all in one place.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16">
          <Link
            to={ROUTES.REGISTER}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-all duration-150"
          >
            Get Started for Free
            <ArrowRight size={15} />
          </Link>
        </div>

        {/* Social proof numbers */}
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 mb-14 text-sm">
          {[
            { n: '10,000+', l: 'teams worldwide' },
            { n: '2M+', l: 'tasks completed' },
            { n: '99.9%', l: 'uptime SLA' },
          ].map(s => (
            <div key={s.l} className="flex items-center gap-2">
              <span className="font-bold text-gray-900 dark:text-white">{s.n}</span>
              <span className="text-gray-400 dark:text-gray-600">{s.l}</span>
            </div>
          ))}
        </div>

        {/* Product preview */}
        <div className="relative mx-auto max-w-4xl">
          <div className="absolute -inset-4 bg-gradient-to-b from-indigo-500/10 to-transparent rounded-3xl blur-2xl pointer-events-none" />
          <KanbanPreview />
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────── TRUSTED BY ───────────────────────── */

const LOGOS = [
  'Acme Corp', 'Pixel Studio', 'Nexus Labs', 'Orbit Tech',
  'CloudBase', 'Stackly', 'Wavefront', 'Crestline',
];

function TrustedBySection() {
  return (
    <section className="py-16 border-y border-gray-100 dark:border-gray-800/60 bg-gray-50/50 dark:bg-gray-900/30">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-600 mb-10">
          Trusted by teams at fast-growing companies
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
          {LOGOS.map(name => (
            <span
              key={name}
              className="text-base font-bold text-gray-300 dark:text-gray-700 hover:text-gray-500 dark:hover:text-gray-500 transition-colors duration-200 select-none tracking-tight"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────── FEATURES ──────────────────────── */

const FEATURES = [
  {
    icon: LayoutGrid,
    title: 'Kanban & Sprint Boards',
    description: 'Visualize your workflow with drag-and-drop Kanban boards. Plan sprints, track progress, and ship faster with total clarity.',
    tag: 'Core',
    accent: 'text-indigo-600 dark:text-indigo-400',
    bg: 'bg-indigo-50 dark:bg-indigo-500/10',
    border: 'border-indigo-100 dark:border-indigo-500/20',
  },
  {
    icon: UserCheck,
    title: 'Smart Task Assignment',
    description: 'Assign tasks to team members, set priorities, and track workload distribution automatically. No more dropped balls.',
    tag: 'Productivity',
    accent: 'text-violet-600 dark:text-violet-400',
    bg: 'bg-violet-50 dark:bg-violet-500/10',
    border: 'border-violet-100 dark:border-violet-500/20',
  },
  {
    icon: ShieldCheck,
    title: 'Role-Based Access Control',
    description: 'Granular permissions for every team member. Define roles, control what each person sees, and keep sensitive data secure.',
    tag: 'Security',
    accent: 'text-teal-600 dark:text-teal-400',
    bg: 'bg-teal-50 dark:bg-teal-500/10',
    border: 'border-teal-100 dark:border-teal-500/20',
  },
  {
    icon: BarChart3,
    title: 'Reports & Analytics',
    description: 'Understand team velocity, track burndown charts, and export progress reports for stakeholders in one click.',
    tag: 'Insights',
    accent: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-500/10',
    border: 'border-amber-100 dark:border-amber-500/20',
  },
];

const EXTRA_FEATURES = [
  { icon: Zap, label: 'Automations' },
  { icon: Globe2, label: 'Integrations' },
  { icon: Clock, label: 'Time Tracking' },
  { icon: Users, label: 'Guest Access' },
  { icon: TrendingUp, label: 'OKR Tracking' },
  { icon: Star, label: 'Priority Matrix' },
];

function FeaturesSection() {
  return (
    <section id="features" className="py-24 px-5 sm:px-8 bg-white dark:bg-gray-950">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-4">Features</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white tracking-tight mb-4">
            Everything your team needs<br className="hidden sm:block" /> to ship great work
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-lg max-w-xl mx-auto">
            Purpose-built tools that fit how modern teams actually work — without the bloat.
          </p>
        </div>

        {/* Feature cards grid */}
        <div className="grid sm:grid-cols-2 gap-5 mb-10">
          {FEATURES.map(f => (
            <div
              key={f.title}
              className="group p-7 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 hover:border-gray-200 dark:hover:border-gray-700 transition-all duration-200"
            >
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-5', f.bg, 'border', f.border)}>
                <f.icon size={18} className={f.accent} />
              </div>
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">{f.title}</h3>
                <span className={cn('text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md ml-3 shrink-0 mt-0.5', f.bg, f.accent)}>{f.tag}</span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>

        {/* More features pill list */}
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          <span className="text-sm text-gray-400 dark:text-gray-600 mr-1">And more:</span>
          {EXTRA_FEATURES.map(f => (
            <div
              key={f.label}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-sm text-gray-600 dark:text-gray-400"
            >
              <f.icon size={13} />
              {f.label}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────── USE CASES ────────────────────────── */

const USE_CASES = [
  {
    label: 'Startups',
    headline: 'Move fast without breaking things',
    body: 'From idea to launch, TeamFlow keeps your small team aligned. Lightweight enough to set up in minutes, powerful enough to scale as you grow. No process overhead, just pure execution.',
    points: ['Launch sprints in under 5 minutes', 'Built-in OKR and goal tracking', 'Scales from 2 to 200 people'],
    accent: 'indigo',
  },
  {
    label: 'IT & Dev Teams',
    headline: 'The command center for engineering',
    body: 'Integrate with GitHub, Jira, and Slack. Track bugs, manage releases, and run retrospectives — all without leaving TeamFlow. Built by engineers, for engineers.',
    points: ['GitHub & GitLab integration', 'Bug tracking & release notes', 'Sprint velocity reporting'],
    accent: 'violet',
  },
  {
    label: 'Agencies',
    headline: 'Deliver client projects on time, every time',
    body: 'Manage multiple client projects side-by-side. Set permissions per client, track billable hours, and generate progress reports in one click.',
    points: ['Multi-client project isolation', 'Guest client access portals', 'Automated status reports'],
    accent: 'teal',
  },
  {
    label: 'Mid-size Businesses',
    headline: 'Enterprise power without the enterprise price',
    body: 'Role-based access, audit logs, SSO, and advanced analytics — everything your compliance and ops teams need, without the six-figure contract.',
    points: ['SSO & SAML support', 'Audit logs & compliance', 'Priority support & SLA'],
    accent: 'amber',
  },
];

const ACCENT_MAP = {
  indigo: { btn: 'bg-indigo-600 text-white hover:bg-indigo-500', active: 'border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10', check: 'text-indigo-500' },
  violet: { btn: 'bg-violet-600 text-white hover:bg-violet-500', active: 'border-violet-500 text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-500/10', check: 'text-violet-500' },
  teal: { btn: 'bg-teal-600 text-white hover:bg-teal-500', active: 'border-teal-500 text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-500/10', check: 'text-teal-500' },
  amber: { btn: 'bg-amber-600 text-white hover:bg-amber-500', active: 'border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10', check: 'text-amber-500' },
};

function UseCasesSection() {
  const [active, setActive] = useState(0);
  const current = USE_CASES[active];
  const colors = ACCENT_MAP[current.accent];

  return (
    <section id="solutions" className="py-24 px-5 sm:px-8 bg-gray-50/60 dark:bg-gray-900/40">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-4">Solutions</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white tracking-tight mb-4">
            Built for every kind of team
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-lg max-w-xl mx-auto">
            Whether you&apos;re a 3-person startup or a 300-person org, TeamFlow adapts to your workflow.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {USE_CASES.map((uc, i) => (
            <button
              key={uc.label}
              onClick={() => setActive(i)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium border transition-all duration-150',
                i === active
                  ? colors.active
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
              )}
            >
              {uc.label}
            </button>
          ))}
        </div>

        {/* Content panel */}
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-5">
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
              {current.headline}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
              {current.body}
            </p>
            <ul className="space-y-2.5">
              {current.points.map(p => (
                <li key={p} className="flex items-center gap-2.5 text-sm text-gray-700 dark:text-gray-300">
                  <CheckCircle size={15} className={colors.check} />
                  {p}
                </li>
              ))}
            </ul>
            <Link
              to={ROUTES.REGISTER}
              className={cn('inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors', colors.btn)}
            >
              Get started free <ArrowRight size={14} />
            </Link>
          </div>

          {/* Visual panel — metrics card */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 space-y-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Team velocity</p>
              <span className="text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/10 px-2 py-0.5 rounded-full font-medium">+18% this month</span>
            </div>
            {['Design', 'Engineering', 'Product', 'DevOps'].map((team, i) => {
              const widths = [78, 92, 65, 84];
              return (
                <div key={team}>
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-500 mb-1.5">
                    <span>{team}</span><span>{widths[i]}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full"
                      style={{ width: `${widths[i]}%` }}
                    />
                  </div>
                </div>
              );
            })}
            <div className="pt-3 border-t border-gray-100 dark:border-gray-800 grid grid-cols-3 gap-3 text-center">
              {[{ v: '48', l: 'Open tasks' }, { v: '12', l: 'Active sprints' }, { v: '94%', l: 'On-time rate' }].map(s => (
                <div key={s.l}>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{s.v}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-600 mt-0.5">{s.l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────── PRICING ─────────────────────────── */


/* ─────────────────────────── CTA ──────────────────────────── */

function CTASection() {
  return (
    <section className="py-24 px-5 sm:px-8 bg-gray-950 dark:bg-gray-900 relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: `radial-gradient(circle, #a5b4fc 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
        }}
      />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-indigo-600/20 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-3xl mx-auto text-center">
        <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight mb-6 leading-tight">
          Your team deserves better<br />project management.
        </h2>
        <p className="text-gray-400 text-lg mb-10 max-w-xl mx-auto">
          Join 10,000+ teams already shipping faster with TeamFlow. Free to start, no credit card required.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to={ROUTES.REGISTER}
            className="flex items-center gap-2 px-7 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            Get Started for Free
            <ArrowRight size={15} />
          </Link>
          <Link
            to={ROUTES.LOGIN}
            className="px-7 py-3.5 text-sm font-semibold text-gray-300 hover:text-white rounded-xl border border-gray-700 hover:border-gray-500 transition-colors"
          >
            Sign in to your team
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────── PAGE ASSEMBLY ─────────────────────── */

export default function LandingPage() {
  return (
    <div className="bg-white dark:bg-gray-950">
      <LandingNavbar />
      <HeroSection />
      <TrustedBySection />
      <FeaturesSection />
      <UseCasesSection />

      <CTASection />
      <Footer />
    </div>
  );
}

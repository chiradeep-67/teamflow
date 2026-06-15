import { ROLES } from '../utils/permissions';

/* ─── Users ─────────────────────────────────────────────────── */
export const MOCK_USERS = [
  {
    id: 'u1', name: 'Sarah Chen', email: 'sarah@teamflow.io',
    systemRole: ROLES.ADMIN, avatar: 'SC', department: 'Engineering',
    title: 'Chief Technology Officer', joinedAt: 'Jan 2024',
    bio: 'Full-stack engineer with 10+ years experience building SaaS products.',
  },
  {
    id: 'u2', name: 'Marcus Rivera', email: 'marcus@teamflow.io',
    systemRole: ROLES.PM, avatar: 'MR', department: 'Product',
    title: 'Senior Project Manager', joinedAt: 'Feb 2024',
    bio: 'PMP-certified PM with expertise in Agile and cross-functional teams.',
  },
  {
    id: 'u3', name: 'Alex Johnson', email: 'alex@teamflow.io',
    systemRole: ROLES.TEAM_LEAD, avatar: 'AJ', department: 'Engineering',
    title: 'Tech Lead — Backend', joinedAt: 'Jan 2024',
    bio: 'Node.js & cloud architect. Leads backend architecture decisions.',
  },
  {
    id: 'u4', name: 'Priya Sharma', email: 'priya@teamflow.io',
    systemRole: ROLES.MEMBER, avatar: 'PS', department: 'Engineering',
    title: 'Senior Full-Stack Developer', joinedAt: 'Mar 2024',
    bio: 'React & Node.js developer passionate about clean, maintainable code.',
  },
  {
    id: 'u5', name: 'Tom Kim', email: 'tom@teamflow.io',
    systemRole: ROLES.MEMBER, avatar: 'TK', department: 'Frontend',
    title: 'Frontend Developer', joinedAt: 'Mar 2024',
    bio: 'UI/UX-focused React developer. Loves TypeScript and design systems.',
  },
  {
    id: 'u6', name: 'Acme Corp', email: 'stakeholder@acmecorp.com',
    systemRole: ROLES.CLIENT, avatar: 'AC', department: 'Client',
    title: 'Product Owner — Acme Corp', joinedAt: 'Apr 2024',
    bio: 'External stakeholder reviewing project progress.',
  },
];

/* ─── Projects ───────────────────────────────────────────────── */
export const MOCK_PROJECTS = [
  {
    id: 'p1',
    name: 'E-Commerce Platform',
    description: 'Full-stack multi-vendor e-commerce solution with Stripe payments, inventory management, and admin dashboard.',
    status: 'active',
    color: '#6366f1',
    startDate: 'Jun 1, 2024',
    dueDate: 'Aug 31, 2024',
    tags: ['React', 'Node.js', 'MongoDB'],
    members: [
      { userId: 'u2', projectRole: ROLES.PM },
      { userId: 'u3', projectRole: ROLES.TEAM_LEAD },
      { userId: 'u4', projectRole: ROLES.MEMBER },
      { userId: 'u5', projectRole: ROLES.MEMBER },
      { userId: 'u6', projectRole: ROLES.CLIENT },
    ],
  },
  {
    id: 'p2',
    name: 'Mobile Banking App',
    description: 'Cross-platform React Native app for retail banking: accounts, transfers, biometric auth, and push notifications.',
    status: 'active',
    color: '#8b5cf6',
    startDate: 'May 15, 2024',
    dueDate: 'Sep 15, 2024',
    tags: ['React Native', 'Firebase', 'Node.js'],
    members: [
      { userId: 'u2', projectRole: ROLES.PM },
      { userId: 'u4', projectRole: ROLES.TEAM_LEAD },
      { userId: 'u5', projectRole: ROLES.MEMBER },
    ],
  },
  {
    id: 'p3',
    name: 'HR Management System',
    description: 'Internal tool for HR: employee onboarding, leave management, payroll reports, and performance reviews.',
    status: 'paused',
    color: '#14b8a6',
    startDate: 'Apr 1, 2024',
    dueDate: 'Jul 31, 2024',
    tags: ['React', 'PostgreSQL'],
    members: [
      { userId: 'u3', projectRole: ROLES.PM },
      { userId: 'u5', projectRole: ROLES.TEAM_LEAD },
      { userId: 'u4', projectRole: ROLES.MEMBER },
    ],
  },
  {
    id: 'p4',
    name: 'Analytics Dashboard',
    description: 'BI dashboard for tracking business KPIs, sales metrics, user analytics, and automated reporting.',
    status: 'completed',
    color: '#f59e0b',
    startDate: 'Mar 1, 2024',
    dueDate: 'Jun 1, 2024',
    tags: ['React', 'D3.js', 'Python'],
    members: [
      { userId: 'u2', projectRole: ROLES.PM },
      { userId: 'u3', projectRole: ROLES.TEAM_LEAD },
      { userId: 'u4', projectRole: ROLES.MEMBER },
    ],
  },
];

/* ─── Tasks ──────────────────────────────────────────────────── */
export const MOCK_TASKS = [
  // P1 — E-Commerce
  { id: 't1', projectId: 'p1', title: 'Design product catalog UI', description: 'Create Figma wireframes and final designs for product listing page, filtering sidebar, and product detail modal. Include mobile breakpoints.', status: 'done', priority: 'high', assignedTo: 'u5', createdBy: 'u3', dueDate: 'Jun 15, 2024', tags: ['Design', 'Frontend'], comments: [{ id: 'c1', userId: 'u3', text: 'Please include dark mode variants.', createdAt: 'Jun 10' }, { id: 'c2', userId: 'u5', text: 'Done! Figma link in the description.', createdAt: 'Jun 14' }] },
  { id: 't2', projectId: 'p1', title: 'Stripe payment gateway integration', description: 'Integrate Stripe for one-time payments, subscriptions, and refunds. Handle webhooks for payment events. Add retry logic for failed payments.', status: 'in_progress', priority: 'urgent', assignedTo: 'u4', createdBy: 'u3', dueDate: 'Jun 20, 2024', tags: ['Backend', 'Payments'], comments: [] },
  { id: 't3', projectId: 'p1', title: 'Shopping cart REST API', description: 'Build endpoints: POST /cart/add, PUT /cart/update, DELETE /cart/remove, GET /cart. Session-based for guests, user-linked for logged-in. Redis for session store.', status: 'in_progress', priority: 'high', assignedTo: 'u4', createdBy: 'u3', dueDate: 'Jun 18, 2024', tags: ['Backend'], comments: [{ id: 'c3', userId: 'u4', text: 'Started on the session management. Redis is set up.', createdAt: 'Jun 16' }] },
  { id: 't4', projectId: 'p1', title: 'JWT authentication system', description: 'Implement JWT-based auth with access + refresh tokens. Email verification on signup. Password reset via email OTP. Rate limiting on auth endpoints.', status: 'in_review', priority: 'high', assignedTo: 'u3', createdBy: 'u2', dueDate: 'Jun 16, 2024', tags: ['Backend', 'Security'], comments: [] },
  { id: 't5', projectId: 'p1', title: 'Admin inventory management panel', description: 'CRUD for products, categories, variants (size/color). Bulk import via CSV. Low stock alerts. Image upload to S3.', status: 'todo', priority: 'medium', assignedTo: 'u5', createdBy: 'u3', dueDate: 'Jul 1, 2024', tags: ['Frontend', 'Backend'], comments: [] },
  { id: 't6', projectId: 'p1', title: 'API documentation (OpenAPI 3.0)', description: 'Document all 40+ endpoints with request/response schemas, auth requirements, and example payloads. Generate Swagger UI.', status: 'todo', priority: 'low', assignedTo: 'u4', createdBy: 'u2', dueDate: 'Jul 10, 2024', tags: ['Docs'], comments: [] },

  // P2 — Mobile Banking
  { id: 't7', projectId: 'p2', title: 'Biometric authentication (Face ID / Touch ID)', description: 'Implement react-native-biometrics for iOS (Face ID) and Android (fingerprint). Fall back to PIN if biometrics unavailable. Store tokens in Keychain/Keystore.', status: 'in_progress', priority: 'urgent', assignedTo: 'u5', createdBy: 'u4', dueDate: 'Jun 17, 2024', tags: ['Mobile', 'Security'], comments: [] },
  { id: 't8', projectId: 'p2', title: 'Transaction history with filters', description: 'Paginated transaction list. Filters: date range, category, amount range, type (debit/credit). Search by description. CSV export.', status: 'todo', priority: 'high', assignedTo: 'u5', createdBy: 'u4', dueDate: 'Jun 25, 2024', tags: ['Mobile', 'Frontend'], comments: [] },
  { id: 't9', projectId: 'p2', title: 'Firebase push notification service', description: 'Set up FCM for transaction alerts, promotional messages, and security alerts. Handle foreground/background/killed app states. Deep link from notification.', status: 'in_review', priority: 'medium', assignedTo: 'u4', createdBy: 'u2', dueDate: 'Jun 20, 2024', tags: ['Backend', 'Mobile'], comments: [] },

  // P3 — HR System
  { id: 't10', projectId: 'p3', title: 'Leave request & approval workflow', description: 'Employees submit leave requests. Manager gets notified and approves/rejects. Calendar view showing team availability. Auto email on status change.', status: 'todo', priority: 'high', assignedTo: 'u5', createdBy: 'u3', dueDate: 'Jul 15, 2024', tags: ['Frontend', 'Backend'], comments: [] },
  { id: 't11', projectId: 'p3', title: 'Employee onboarding checklist', description: 'Dynamic checklist for new hires: IT setup, HR docs, training modules. Progress tracking. Manager gets completion notification.', status: 'in_progress', priority: 'medium', assignedTo: 'u4', createdBy: 'u3', dueDate: 'Jul 20, 2024', tags: ['Frontend'], comments: [] },
];

/* ─── Activity Feed ──────────────────────────────────────────── */
export const MOCK_ACTIVITY = [
  { id: 'a1', userId: 'u4', action: 'moved', target: 'Stripe payment gateway integration', targetType: 'task', to: 'In Progress', projectId: 'p1', time: '5 min ago' },
  { id: 'a2', userId: 'u5', action: 'completed', target: 'Design product catalog UI', targetType: 'task', projectId: 'p1', time: '1 hr ago' },
  { id: 'a3', userId: 'u2', action: 'created project', target: 'Mobile Banking App', targetType: 'project', projectId: 'p2', time: '2 hr ago' },
  { id: 'a4', userId: 'u3', action: 'assigned', target: 'Shopping cart REST API', targetType: 'task', to: 'Priya Sharma', projectId: 'p1', time: '3 hr ago' },
  { id: 'a5', userId: 'u4', action: 'commented on', target: 'JWT authentication system', targetType: 'task', projectId: 'p1', time: 'Yesterday' },
  { id: 'a6', userId: 'u2', action: 'added', target: 'Tom Kim', targetType: 'member', to: 'Mobile Banking App', projectId: 'p2', time: 'Yesterday' },
];

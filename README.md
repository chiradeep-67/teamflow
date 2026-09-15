# TeamFlow

**TeamFlow** is a full-stack team and project management platform built with the MERN stack. Organizations can create workspaces, manage projects, assign tasks on a Kanban board, invite team members, and track work with role-based access control and real-time notifications.

Built as a production-style SaaS app — multi-tenant, secured, and deployable.

---

## Live Demo

| App | URL |
|-----|-----|
| Frontend | _Add your Vercel URL here_ |
| API | `https://teamflow-api-server.vercel.app/api` |
| Health check | `https://teamflow-api-server.vercel.app/api/health` |

> Replace the frontend URL once deployed. Add screenshots below for your portfolio.

---

## Screenshots

_Add 3–5 screenshots here (landing page, project board, task detail, dashboard)._

```
docs/screenshots/
  landing.png
  board.png
  task-detail.png
```

---

## Features

### Organization & workspace
- Multi-tenant architecture — each organization is fully isolated
- Workspace setup with departments and branding
- Public org signup (`/create-org`) or invite-only registration

### Projects & tasks
- Project boards with Kanban-style task columns (todo → in progress → in review → done)
- Task priorities (urgent / high / medium / low), tags, due dates, and comments
- Task assignment with automatic notifications to assignees

### Roles & permissions
- **System roles:** Admin, Project Manager, Team Lead, Member
- **Project roles:** per-project membership with scoped permissions
- Backend + frontend guards — members can only edit their own assigned tasks

### Team management
- Invite team members via email tokens
- Employee management (admin)
- Team page for leads and managers

### Notifications
- In-app notifications for task assignment, status changes, and comments
- Deduplicated recipient logic (no double-notify)

### Security
- JWT authentication with bcrypt password hashing
- Helmet security headers
- Rate limiting on auth routes
- CORS allowlist (localhost + Vercel)
- Organization-scoped queries on every data access (prevents cross-tenant data leaks)

### UX
- Dark mode
- Responsive layout with sidebar navigation
- Toast notifications
- Landing page with product preview
- Onboarding flow for new organizations

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, Vite, Tailwind CSS 4, React Router 7, Axios, Lucide icons |
| Backend | Node.js, Express 4, Mongoose 8 |
| Database | MongoDB (Atlas) |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| Security | Helmet, express-rate-limit, express-validator |
| Email | Nodemailer |
| Deployment | Vercel (frontend + serverless API) |

---

## Project Structure

```
teamflow/
├── client/                 # React frontend (Vite)
│   ├── src/
│   │   ├── pages/          # Route pages (Dashboard, Projects, Tasks…)
│   │   ├── components/     # UI + layout components
│   │   ├── context/        # Auth, Theme, Toast providers
│   │   ├── services/       # API client (axios)
│   │   ├── hooks/          # Custom hooks (permissions)
│   │   └── utils/          # Constants, helpers
│   └── vercel.json
│
├── server/                 # Express API
│   ├── models/             # Mongoose schemas (User, Task, Project…)
│   ├── routes/             # API route handlers
│   ├── middleware/         # Auth + role guards
│   ├── controllers/        # Auth logic
│   ├── config/             # DB connection
│   ├── seed.js             # Dev seed script
│   └── vercel.json
│
└── learning-vault/         # Personal study notes (not part of the app)
```

---

## Getting Started (Local Development)

### Prerequisites
- Node.js 18+
- MongoDB (local or [MongoDB Atlas](https://www.mongodb.com/atlas) free tier)

### 1. Clone and install

```bash
git clone <your-repo-url>
cd teamflow

# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 2. Backend environment

```bash
cd server
cp .env.example .env
```

Edit `server/.env`:

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/teamflow
JWT_SECRET=your_long_random_secret_here
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
```

### 3. Seed an admin user (first-time setup)

```bash
cd server
node seed.js "My Company" "admin@mycompany.com" "SecurePass123"
```

This creates an Organization, Workspace, and Admin user. You'll be forced to change the password on first login.

### 4. Run the backend

```bash
cd server
npm run dev
```

API runs at `http://localhost:5000`

### 5. Run the frontend

```bash
cd client
npm run dev
```

App opens at `http://localhost:5173`

The frontend talks to `http://localhost:5000/api` by default (no `.env` needed locally).

---

## API Overview

| Route prefix | Purpose |
|--------------|---------|
| `POST /api/auth/login` | Login, returns JWT |
| `POST /api/auth/register` | Register via invite token |
| `POST /api/auth/create-org` | Public org signup |
| `GET  /api/auth/me` | Current user |
| `GET  /api/projects` | List projects |
| `GET  /api/projects/:id/tasks` | List tasks in a project |
| `POST /api/projects/:id/tasks` | Create task (PM / TL only) |
| `PUT  /api/projects/:id/tasks/:taskId` | Update task |
| `GET  /api/notifications` | User notifications |
| `GET  /api/health` | Health check |

All protected routes require `Authorization: Bearer <token>`.

---

## Deployment (Vercel)

Both `client/` and `server/` include `vercel.json` configs.

**Backend env vars on Vercel:**
- `MONGO_URI` — Atlas connection string
- `JWT_SECRET` — long random secret
- `CLIENT_URL` — your frontend Vercel URL

**Frontend env var on Vercel:**
- `VITE_API_URL` — your backend URL + `/api` (e.g. `https://teamflow-api-server.vercel.app/api`)

---

## Architecture Highlights

```
Browser (React)
    ↓ axios + JWT interceptor
Express API (server.js)
    ↓ protect middleware (JWT verify)
    ↓ checkRole middleware (system + project roles)
    ↓ route handler
MongoDB (organization-scoped queries)
    ↓
JSON response → React re-render
```

**Key design decisions:**
- Tasks are nested under projects (`/api/projects/:id/tasks`) — enforces project context
- `organizationId` on every query — prevents cross-tenant data access (IDOR protection)
- Notification failures are isolated — task creation never breaks if notify fails
- Lazy DB connection — works on Vercel serverless cold starts

---



## Author

**Chiradeep** — MERN stack developer

---

## License

MIT

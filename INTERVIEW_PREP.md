# TeamFlow — React Fresher Interview Prep

**Company:** Adroitts Telecom  
**Interview length:** ~20 minutes (short screening)  
**Your level:** Fresher — React project done; JavaScript still learning; English improving — **short answers are OK.**

---

## 0. Adroitts Telecom — read this first

### What this interview will look like (20 min)

| Part | Time | Focus |
|------|------|--------|
| Intro | ~2 min | Who you are + why Adroitts Telecom |
| Project | ~5 min | TeamFlow in simple words |
| React / JS | ~8 min | ~5–8 quick questions |
| Your questions | ~2 min | Ask 1–2 from section (b) |
| Close | ~1 min | Thank you |

They will **not** have time for all 40 questions below. **Tonight:** section **0.3** + intro **(c)** + **8 must-know** in **0.4**.

### About the company (simple facts — don’t overclaim)

- **Adroitts** ([adroitts.com](https://www.adroitts.com)) is an **IT / software services** company (apps, cloud, data, security, consulting). They work with **business clients**, not only one product.
- **Adroitts Telecom** is the name on **your interview** — often that means **telecom-related** or **client web work** (portals, dashboards, internal tools). React roles still look like **forms, tables, login, API data** — same ideas as TeamFlow.
- Use the exact name **“Adroitts Telecom”** that HR used in email. If they say “Adroitts” only, follow them.

**If you don't know the company deep:** “I read the job post. It is a React fresher role. I want to learn on real projects with your team.”

### Why TeamFlow fits this interview

TeamFlow shows skills services companies care about:

- **Login and roles** — like staff portals (who can see what).
- **Dashboards and lists** — projects, tasks, reports pages.
- **API + database** — real full-stack, not only static UI.
- **Multi-tenant / org isolation** — one app, many companies separated (`organizationId`) — common in B2B software.

**Say once:** “TeamFlow is practice for the kind of web apps I hope to build at Adroitts Telecom — login, data from API, and role-based screens.”

### JavaScript — minimum for tomorrow (you said JS is weak)

You learn JS **through your React project**. If they ask JS, tie back to TeamFlow:

| Word | Simple meaning | TeamFlow example |
|------|----------------|------------------|
| `const` / `let` | Variable | `const { login } = useAuth()` |
| Object `{ }` | User, form data | `{ email, password }` in login |
| Array + `.map()` | List → UI | Project cards on board |
| `async` / `await` | Wait for API | `await login(form)` |
| `?.` | Safe if null | `user?.systemRole` |
| `localStorage` | Save token | `tf_token` after login |
| Spread `...` | Update one field | `{ ...f, email: value }` |

**Honest line:** “JavaScript is still new for me. I understand how I used it in TeamFlow — state, forms, and API calls — and I am learning more every day.”

### 0.4 — Must-know 8 (20-minute interview)

Practice **out loud** with file names:

1. **Q1** — About yourself + Adroitts Telecom  
2. **Adroitts Q** — Why this company (section 1, Q1b)  
3. **Q6** — Props vs state  
4. **Q10** — Controlled input  
5. **Q17** — `useAuth` / login flow  
6. **Q22** — Protected route  
7. **Q33** — JWT (short)  
8. **Q38** — Why no Redux  

Skip the rest until after the interview.

---

**How to use the full list:** Read each answer out loud 2–3 times. Open the file path so you can say “I used this in `LoginPage.jsx`…”

**Honest note (AI + learning):** “I built TeamFlow with React and Node. I used AI tools to move faster, but I read the code, ran the app, and I can explain login, protected routes, and the board.”

---

## 1. Self-intro and project overview (5 questions + Adroitts)

### Q1. Tell me about yourself.

**Short answer:** Good morning. My name is [Your Name]. I am a fresher learning web development. I applied to **Adroitts Telecom** for a **React** role. My main project is TeamFlow — login, roles, projects, and a task board. JavaScript is still new, but I understand my project code. I am improving my English, and I am ready to learn from your team on real work.

**In my code:** Whole project — start with `README.md` and `client/src/App.jsx`.

**If you don't know:** “I am a fresher applying to Adroitts Telecom. I built TeamFlow with React to learn login and dashboards.”

### Q1b. Why Adroitts Telecom? Why this job?

**Short answer:** I want my **first job** in software, not only learning alone. The job post matched **React**, which I practiced on TeamFlow. I am interested in **telecom / IT services** because companies need reliable web apps — portals, dashboards, and tools for teams. I want to grow under senior developers and learn your process and stack.

**In my code:** N/A — link to project: “TeamFlow shows I can build login, API integration, and role-based pages.”

**If you don't know:** “This role fits my React learning. I want to start my career with Adroitts Telecom and learn on the job.”

### Q1c. What do you know about Adroitts / Adroitts Telecom?

**Short answer:** I know Adroitts works in **software and IT services** — building solutions for clients, with focus areas like cloud, data, and security on their website. For **Adroitts Telecom**, I understand my interview is for **React development**, likely supporting **business or telecom-related applications**. I do not know your internal projects yet, but I am eager to learn after joining.

**If you don't know:** “I checked the company online — IT services and software. I want to learn your telecom projects after I join.”

---

### Q2. What is TeamFlow? What problem does it solve?

**Short answer:** TeamFlow helps a company manage projects and tasks in one place. Users log in, see projects they can access, and move tasks on a board like To Do and Done. Admins can invite people and set roles so not everyone can change everything. It is like a small version of tools such as Trello or Asana.

**In my code:** `README.md` (Features section); main UI entry `client/src/pages/ProjectsPage.jsx` (board/list).

**If you don't know:** “It is a task and project app for teams, with login and different user roles.”

---

### Q3. What is your tech stack for TeamFlow?

**Short answer:** The front end is React 19 with Vite, React Router, Tailwind CSS, and Axios for API calls. The back end is Node.js, Express, MongoDB with Mongoose, JWT for login, and bcrypt for passwords. The client talks to the server at `/api` routes.

**In my code:** `client/package.json`; `server/package.json`; `client/src/services/api.js` (`BASE_URL`).

**If you don't know:** “React front end, Node and Express API, MongoDB database.”

---

### Q4. How is the project folder structured?

**Short answer:** There are two main folders: `client` for React and `server` for the API. Inside `client/src` I have `pages` for screens, `components` for reusable UI, `context` for global state like auth, and `hooks` for shared logic. Inside `server` I have `routes`, `controllers`, `models`, and `middleware`.

**In my code:** `client/src/App.jsx` (imports pages); `server/server.js` (mounts routes).

**If you don't know:** “Front end in `client`, back end in `server`, pages and components inside `src`.”

---

### Q5. What was your role in building this? Did you use AI?

**Short answer:** I designed the idea and learned by building TeamFlow step by step. I used AI tools to help write boilerplate and fix errors faster, like many developers do today. After that I studied each file — especially login, protected routes, and the Kanban page — so I can explain the flow. I can demo the app and walk through the code.

**In my code:** Any feature you know best — e.g. `client/src/context/AuthContext.jsx` (`login` function).

**If you don't know:** “I built it with help from AI, then I read and tested the code myself.”

---

## 2. React basics (7 questions)

### Q6. What is the difference between props and state?

**Short answer:** Props are data passed from a parent to a child; the child should not change them. State is data inside a component that can change over time, like form input or a loading flag. When state changes, React re-renders that component.

**In my code:** Props — `client/src/components/ui/Button.jsx` (`variant`, `isLoading`, `children`); State — `client/src/pages/LoginPage.jsx` (`useState` for `form`, `errors`).

**If you don't know:** “Props come from outside; state lives inside the component and updates the UI.”

---

### Q7. What is the Virtual DOM? Why does React use it?

**Short answer:** The Virtual DOM is a light copy of the real DOM in memory. When state changes, React builds a new virtual tree and compares it with the old one. Then it updates only the parts of the real page that changed, which is faster than rewriting the whole page.

**In my code:** You do not see “Virtual DOM” in code — it is how React works when state updates, e.g. `client/src/pages/ProjectsPage.jsx` when `setProjects` runs after fetch.

**If you don't know:** “React updates the UI efficiently by comparing old and new UI in memory first.”

---

### Q8. What is the `useEffect` dependency array? What happens if you leave it empty `[]`?

**Short answer:** The dependency array tells React when to run the effect again. If you pass `[]`, the effect runs once after the first render — good for fetch on mount. If you omit the array, it runs after every render, which can cause loops. If you list values like `[id]`, it runs when `id` changes.

**In my code:** Empty deps — `client/src/context/AuthContext.jsx` (`useEffect` on mount, line ~19); With `[id]` — `client/src/pages/ProjectDetailPage.jsx` (`useEffect` load project, ~633).

**If you don't know:** “`[]` means run once on load; `[id]` means run again when `id` changes.”

---

### Q9. Why do we need `key` when rendering a list?

**Short answer:** React uses `key` to know which list item is which when the list changes. A stable unique key — like database `_id` — helps React update the right row without bugs. Using array index as key is weak if items are reordered or deleted.

**In my code:** `client/src/pages/ProjectDetailPage.jsx` — `tasks.map(task => <TaskCard key={task._id} …`)`; `client/src/context/ToastContext.jsx` — `toasts.map(t => <Toast key={t.id} …`)`.

**If you don't know:** “Keys help React track each item in a list correctly.”

---

### Q10. What is a controlled input?

**Short answer:** A controlled input means React owns the value through `useState`. The input shows `value={form.email}` and updates with `onChange`. That way validation and submit always use the latest data in state.

**In my code:** `client/src/pages/LoginPage.jsx` — `Input` with `value={form.email}` and `onChange`; wrapper `client/src/components/ui/Input.jsx`.

**If you don't know:** “The input value is stored in state, not only in the DOM.”

---

### Q11. What is “lifting state up”?

**Short answer:** When two children need the same data, you move state to their common parent. The parent holds state and passes values and setter functions down as props. This avoids duplicate state that can get out of sync.

**In my code:** `client/src/pages/ProjectsPage.jsx` — parent holds `projects`, `showModal`; `CreateModal` gets `onCreate`, `onClose` as props instead of owning the project list.

**If you don't know:** “Shared state goes in the parent and is passed down as props.”

---

### Q12. Context vs prop drilling — when did you use Context?

**Short answer:** Prop drilling is passing props through many layers that do not need them. Context lets you share data — like logged-in user — anywhere under a Provider. TeamFlow uses Context for auth, theme, and toasts because many pages need them.

**In my code:** `client/src/context/AuthContext.jsx` (`AuthProvider`, `useAuth`); wired in `client/src/App.jsx` (`<AuthProvider>`).

**If you don't know:** “Context shares global data like user login without passing props through every component.”

---

## 3. Hooks and patterns in TeamFlow (8 questions)

### Q13. How do you use `useState` in this project?

**Short answer:** Almost every page uses `useState` for forms, loading flags, and API data. I often use object state for forms, like `{ email, password }`. I also use lazy init `useState(() => …)` when reading localStorage on first render.

**In my code:** `client/src/pages/LoginPage.jsx` (`form`, `errors`); lazy init — `client/src/context/AuthContext.jsx` (`user` from localStorage).

**If you don't know:** “`useState` stores data that changes the UI, like form fields and loading.”

---

### Q14. How do you fetch data with `useEffect`?

**Short answer:** On mount I set `loading` true, call the API, then save result in state and set `loading` false. I use `async` functions inside the effect. On `ProjectDetailPage` I also use a `cancelled` flag so old requests do not update state after unmount.

**In my code:** `client/src/pages/ProjectsPage.jsx` (`useEffect` loads projects/tasks); `client/src/pages/ProjectDetailPage.jsx` (`load()` with `cancelled`).

**If you don't know:** “I fetch in `useEffect`, save in `useState`, and show a spinner while loading.”

---

### Q15. Why did you use `useRef` in TeamFlow?

**Short answer:** `useRef` holds a value that does not cause a re-render when it changes. I use it for DOM focus, click-outside checks, toast IDs, and drag-and-drop info during Kanban moves.

**In my code:** `client/src/context/ToastContext.jsx` (`counter` ref for toast id); `client/src/components/layout/AppSidebar.jsx` (`notifRef` for dropdown); `client/src/pages/ProjectDetailPage.jsx` (`dragging` ref).

**If you don't know:** “Ref stores DOM nodes or values that should not trigger re-render.”

---

### Q16. Why `useCallback` in Auth and Toast context?

**Short answer:** `useCallback` keeps the same function reference between renders unless dependencies change. That helps when passing functions in context value so child components do not re-render for no reason. Auth uses it for `getAccessibleProjects` and `getProjectRole`.

**In my code:** `client/src/context/AuthContext.jsx` (`getAccessibleProjects`, `getProjectRole`); `client/src/context/ToastContext.jsx` (`toast`, `success`, `error`).

**If you don't know:** “It memoizes functions so they stay stable across renders.”

---

### Q17. Explain `useAuth` — what does it provide?

**Short answer:** `useAuth` reads `AuthContext`. It gives the current `user`, workspace, loading flags, and actions like `login`, `logout`, and `register`. On app start it checks the token and loads workspace. Login saves token and user in localStorage.

**In my code:** `client/src/context/AuthContext.jsx` — `AuthProvider`, `useAuth`, `login`, `_persist`.

**If you don't know:** “Custom hook that gives user and login/logout from context.”

---

### Q18. What does `usePermissions` do?

**Short answer:** It wraps auth and adds permission helpers. You can call `can('somePermission')` for system role, or `canIn(project, permission)` for project level. Pages use it to show or hide buttons without repeating role checks everywhere.

**In my code:** `client/src/hooks/usePermissions.js` (`usePermissions`); logic in `client/src/utils/permissions.js`; usage — `client/src/pages/DashboardPage.jsx`.

**If you don't know:** “It checks what the logged-in user is allowed to do based on role.”

---

### Q19. How do `RoleGate` and route guards work together?

**Short answer:** Route guards in `App.jsx` block whole pages — for example only admin sees Settings. `RoleGate` hides parts inside a page, like admin-only widgets on the dashboard. Admin usually passes all gates.

**In my code:** Routes — `client/src/App.jsx` (`RequireRole`, `ProtectedLayout`); UI gate — `client/src/components/common/RoleGate.jsx` (`RoleGate`).

**If you don't know:** “Router blocks pages; `RoleGate` hides sections on a page.”

---

### Q20. How does the toast system work?

**Short answer:** `ToastProvider` keeps a list of toasts in state. Calling `success()` or `error()` adds a message and removes it after a few seconds. Toasts render in a fixed corner on top of the app.

**In my code:** `client/src/context/ToastContext.jsx` (`ToastProvider`, `useToast`); used in `client/src/pages/TaskDetailPage.jsx`.

**If you don't know:** “Global popup messages via context.”

---

## 4. React Router (5 questions)

### Q21. How is routing set up in TeamFlow?

**Short answer:** `App.jsx` wraps the app in `BrowserRouter`. Each URL is a `Route` with an `element` — usually a page component. Public routes include login and landing; most app pages sit inside a protected layout with a sidebar.

**In my code:** `client/src/App.jsx` — `BrowserRouter`, `Routes`, `Route`.

**If you don't know:** “React Router maps URLs to page components in `App.jsx`.”

---

### Q22. What is a protected route? How did you implement it?

**Short answer:** A protected route needs a logged-in user. `ProtectedLayout` reads `user` from `useAuth`. If there is no user, it redirects to login with `<Navigate>`. It also waits for `workspaceLoaded` before deciding, so users do not flash the wrong screen.

**In my code:** `client/src/App.jsx` — `ProtectedLayout` function; nested routes under `<Route element={<ProtectedLayout />}>`.

**If you don't know:** “If not logged in, redirect to login.”

---

### Q23. What are nested routes and `Outlet`?

**Short answer:** Nested routes share a parent layout. The parent renders once and child routes render where `<Outlet />` is placed. In TeamFlow the parent shows the sidebar and the outlet shows Dashboard, Board, Profile, etc.

**In my code:** `client/src/App.jsx` — `ProtectedLayout` returns `<Outlet />` inside `<main>`.

**If you don't know:** “Parent layout wraps children; `Outlet` is where the child page appears.”

---

### Q24. How do you read URL parameters like project id?

**Short answer:** I use `useParams()` from React Router. For example `/projects/:id` gives `id` in `ProjectDetailPage`. Task detail uses both `projectId` and `taskId` from the path.

**In my code:** `client/src/pages/ProjectDetailPage.jsx` — `const { id } = useParams()`; `client/src/pages/TaskDetailPage.jsx` — `projectId`, `taskId`.

**If you don't know:** “`useParams` reads `:id` from the URL.”

---

### Q25. How do you navigate after login without full page reload?

**Short answer:** I use `useNavigate()` from React Router. After successful login, `navigate()` sends the user to the board or change-password page. This is client-side navigation, so it is fast and keeps React state.

**In my code:** `client/src/pages/LoginPage.jsx` — `handleSubmit` calls `navigate(...)`; `client/src/services/api.js` uses `window.location.href` only on 401 logout.

**If you don't know:** “`useNavigate` changes page inside the SPA.”

---

## 5. JavaScript basics (7 questions)

### Q26. `let`, `const`, and `var` — what do you use?

**Short answer:** I use `const` by default for variables that are not reassigned. I use `let` when the value changes, like loop counters or reassignments. I avoid `var` because it has old scoping rules; modern code uses `const` and `let`.

**In my code:** Throughout — e.g. `client/src/pages/LoginPage.jsx` (`const navigate`, `const [form, setForm]`).

**If you don't know:** “`const` for fixed binding, `let` when I reassign; I don't use `var`.”

---

### Q27. Arrow functions — where do you use them?

**Short answer:** Arrow functions are short and keep `this` lexical in normal React code. I use them in `onChange` handlers, `.map()` callbacks, and async route handlers. Components themselves are often `export default function LoginPage()`.

**In my code:** `client/src/pages/LoginPage.jsx` — `onChange={e => setForm(f => ({ ...f, email: e.target.value }))}`; `server/controllers/authController.js` — `const login = async (req, res) =>`.

**If you don't know:** “Shorter functions for handlers and callbacks.”

---

### Q28. Destructuring and spread — examples from your code?

**Short answer:** Destructuring pulls fields out of objects — like `{ user, login } = useAuth()`. Spread copies objects — like `{ ...prev, ...fields }` when updating user profile. Rest props `...props` pass extra props to `Button` and `Input`.

**In my code:** `client/src/context/AuthContext.jsx` — `updateUser` uses `{ ...prev, ...fields }`; `client/src/components/ui/Button.jsx` — `...props` on `<button>`.

**If you don't know:** “Destructuring unpacks objects; spread copies or merges objects.”

---

### Q29. `map` and `filter` in the UI?

**Short answer:** `map` turns an array into JSX list items, like projects on the board. `filter` narrows a list, like search or status filter before rendering. Both are common in React because UI is data-driven.

**In my code:** `client/src/pages/ProjectsPage.jsx` — map projects to cards; filter by search/`filter` state (same file).

**If you don't know:** “`map` renders lists; `filter` picks items that match a condition.”

---

### Q30. Promises and `async/await` — how does login use them?

**Short answer:** API calls return promises. `async/await` lets me write them like step-by-step code. In `login`, I `await authAPI.login`, then save token or return an error object for the UI.

**In my code:** `client/src/context/AuthContext.jsx` — `login` is `async`; `client/src/pages/LoginPage.jsx` — `handleSubmit` awaits `login(form)`.

**If you don't know:** “`async/await` waits for API calls without nested `.then` chains.”

---

### Q31. How does `localStorage` work in TeamFlow?

**Short answer:** After login I save JWT in `tf_token` and user JSON in `tf_user`. On reload, AuthContext reads them so the user stays logged in. Axios interceptor reads the token and sends `Authorization: Bearer …` on each request.

**In my code:** `client/src/context/AuthContext.jsx` — `TOKEN_KEY`, `USER_KEY`, `_persist`; `client/src/services/api.js` — request interceptor.

**If you don't know:** “Browser storage for token so refresh keeps you logged in.”

---

### Q32. What is optional chaining `?.` in your code?

**Short answer:** `?.` safely reads nested properties when something might be null. For example `user?.systemRole` avoids crash if user is not loaded yet. I use it a lot with API data and auth.

**In my code:** `client/src/context/AuthContext.jsx` — `err.response?.status === 401`; `client/src/App.jsx` — `user?.systemRole`.

**If you don't know:** “It returns undefined instead of throwing if the left side is null.”

---

## 6. TeamFlow backend and security (5 questions)

### Q33. Explain the JWT login flow end to end.

**Short answer:** User posts email and password to `/api/auth/login`. Server checks password, then signs a JWT with user id. Client stores token and sends it on every API call. Middleware `protect` verifies JWT and loads `req.user` for each protected route.

**In my code:** Server — `server/controllers/authController.js` (`login`, `generateToken`); `server/middleware/auth.js` (`protect`); Client — `client/src/context/AuthContext.jsx` (`login`, `_persist`); `client/src/services/api.js` (interceptor).

**If you don't know:** “Login returns a token; each API request sends that token; server checks it.”

---

### Q34. Why bcrypt? Where is password hashing?

**Short answer:** Passwords must never be stored as plain text. bcrypt hashes on save and compares on login. Mongoose `pre('save')` hashes when password changes; `matchPassword` checks login.

**In my code:** `server/models/User.js` — `pre('save')`, `matchPassword`; login check — `server/controllers/authController.js` (`login`).

**If you don't know:** “Passwords are hashed in the database; login compares hash, not plain text.”

---

### Q35. What is RBAC in TeamFlow?

**Short answer:** RBAC means Role-Based Access Control. System roles are admin, project_manager, team_lead, and member. Routes use `requireRole`; projects also have member roles via `requireProjectRole`. Admin often bypasses checks but data stays inside their organization.

**In my code:** `server/middleware/checkRole.js` (`requireRole`, `requireProjectRole`); `server/models/User.js` (`systemRole` enum); client — `client/src/App.jsx` (`RequireRole`).

**If you don't know:** “Different roles can do different things, checked on server and UI.”

---

### Q36. What are org-scoped queries? Why do they matter?

**Short answer:** Every user belongs to an `organizationId`. Queries include that id so one company never sees another company's projects. For example `Project.findOne({ _id, organizationId: req.user.organizationId })`.

**In my code:** `server/routes/projectRoutes.js` — GET `/` query; `server/middleware/checkRole.js` — `requireProjectMember` find with `organizationId`.

**If you don't know:** “All database queries filter by the user's organization for multi-tenant safety.”

---

### Q37. Helmet, rate limiting, and CORS — what do they do here?

**Short answer:** Helmet sets safer HTTP headers. Rate limit on `/api/auth` stops too many login attempts — 20 per 15 minutes. CORS allows only trusted front-end origins (localhost, `CLIENT_URL`, Vercel) so random sites cannot call our API from the browser.

**In my code:** `server/server.js` — `helmet()`, `authLimiter`, `cors({ origin: … })`.

**If you don't know:** “Helmet secures headers; rate limit slows brute force; CORS controls which front ends can call the API.”

---

## 7. Tricky / trap questions (3 questions)

### Q38. Why did you not use Redux?

**Short answer:** TeamFlow is medium size. Auth, theme, and toasts are shared — Context is enough. Most data lives on one page in local `useState` after fetch. Redux would add files and boilerplate without a clear benefit for this project.

**In my code:** Global state — `client/src/context/AuthContext.jsx`, `ThemeContext.jsx`, `ToastContext.jsx`; page state — e.g. `client/src/pages/TeamPage.jsx`.

**If you don't know:** “Context and local state were enough; Redux felt too heavy for this app.”

---

### Q39. Why no `useMemo` or `React.memo`?

**Short answer:** I did not hit performance problems yet. Lists are not huge and there is no expensive calculation on every render. If the board slowed down with thousands of tasks, I would memoize filtered lists or split components.

**In my code:** No `useMemo` in `client/src` (grep confirms); heavy UI — `client/src/pages/ProjectDetailPage.jsx` (Kanban).

**If you don't know:** “I kept it simple; I would add memoization if profiling showed slowness.”

---

### Q40. What would you improve? What was a hard bug?

**Short answer:** I would add React Query for caching and less manual loading state. I would add error boundaries for nicer crashes. A hard issue was Kanban drag-and-drop on phones — HTML5 drag does not work on touch, so I added a “Move to” dropdown and `useIsTouchOrSmallScreen` on small screens.

**In my code:** Touch/Kanban — `client/src/pages/ProjectDetailPage.jsx` (`useIsTouchOrSmallScreen`, `showMoveMenu`, comments ~45–68); fetch pattern to improve — any page `useEffect` + `useState`.

**If you don't know:** “Mobile Kanban needed a non-drag fallback; I'd add better data fetching and error handling next.”

---

## (a) 10 quick-fire one-line answers

1. **React?** — Library to build UI with components and state.
2. **Vite?** — Fast dev server and build tool for the React app.
3. **JSX?** — HTML-like syntax inside JavaScript.
4. **Hook?** — Function like `useState` that adds features to function components.
5. **SPA?** — Single page app; React Router swaps pages without full reload.
6. **JWT?** — Signed token that proves who you are after login.
7. **MERN?** — MongoDB, Express, React, Node.
8. **Middleware?** — Function that runs before route handler, e.g. `protect`.
9. **Axios?** — HTTP client to call the API from React.
10. **Multi-tenant?** — Many orgs on one app, data separated by `organizationId`.

**Adroitts / telecom context (bonus one-liners):**

11. **Portal?** — Web app where users log in to see their data (like TeamFlow after login).
12. **RBAC?** — Different roles see different menus — same idea as admin vs member in TeamFlow.
13. **Client project?** — Software built for a customer; services companies like Adroitts often do this.

---

## (b) Questions to ask Adroitts Telecom (pick 1–2 in a 20-min call)

1. For this React role, will I work on **telecom products** or **general client web applications**?
2. What **React version** and tools does the team use today?
3. For **freshers**, is there **training** or a **mentor** in the first few months?
4. Will the work be **mostly UI**, or also **API integration** like calling backend services?
5. What is the **next step** after this interview?

*(Skip long questions about salary unless they bring it up.)*

---

## (c) 40-second self-introduction — Adroitts Telecom (read aloud 5 times)

“Good morning. My name is [Your Name]. I am a fresher developer. I applied to **Adroitts Telecom** for the **React** position. I am still building my **JavaScript** skills, but I completed a full-stack project called **TeamFlow** — a team task app with **login**, **roles**, and a **Kanban board**. The front end is **React** with **React Router** and **Context** for auth. The back end is **Node**, **Express**, and **MongoDB**. I used **AI tools** to move faster, then I **studied the code** so I can explain **login** and **protected routes**. I want to learn your stack and contribute to real projects here. Thank you.”

---

## (d) Tonight checklist (~30 min)

- [ ] Read intro **(c)** out loud 5 times  
- [ ] Practice **Q1**, **Q1b**, and **must-know 8** (section **0.4**)  
- [ ] Open and skim: `AuthContext.jsx`, `App.jsx`, `LoginPage.jsx`  
- [ ] Run app once: login → board (or be ready to say how you would debug API URL)  
- [ ] Write **[Your Name]** in intro; check interview **time + link**

---

*Good luck at Adroitts Telecom. For 20 minutes, know cold: `AuthContext.jsx`, `App.jsx`, `LoginPage.jsx` (optional deep: `ProjectDetailPage.jsx` if they ask “hardest feature”).*

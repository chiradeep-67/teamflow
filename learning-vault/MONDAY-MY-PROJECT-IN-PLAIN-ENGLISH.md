# TEAMFLOW IN PLAIN ENGLISH — your Monday script

**Everything here is true about your actual code.** I read your models, your middleware and
your routes to write it. Nothing is invented, so you can say all of it with a clear conscience.

**No code in this file.** You don't need to read code to explain a system — architects describe
buildings without laying bricks. Learn this and you can hold a real conversation about your
project.

---

# 1. THE 30-SECOND ANSWER
### Memorise this almost word for word. It's the answer to "tell me about your project."

> "TeamFlow is a team and project management web application — a bit like Trello or Jira, but
> smaller. A company signs up and creates an organisation. Inside that organisation they create
> projects, add team members to each project, and create tasks. Tasks move across a board:
> To Do, In Progress, In Review, and Done.
>
> The main thing I focused on was permissions. Every user has a role, and their role decides
> what they're allowed to do. I built it with React on the frontend, Node and Express for the
> backend API, and MongoDB for the database. It's deployed on Vercel."

Then **stop**. Let them ask the next question. Don't fill the silence.

---

# 2. THE FOUR PIECES — the whole architecture

Think of a restaurant. This analogy works for the entire interview.

| Piece | Restaurant | What it is in TeamFlow |
|---|---|---|
| **Frontend** | The dining room | What the user sees and clicks. Built with **React**. |
| **Backend** | The kitchen | Where decisions and rules happen. **Node + Express**. |
| **Database** | The store room | Where information is kept permanently. **MongoDB**. |
| **API** | The waiter | Carries messages between dining room and kitchen. |

> "The frontend is what the user sees. When they click something, it sends a request to my
> backend API. The backend checks whether they're allowed to do it, talks to the database, and
> sends the answer back. The frontend then shows the result."

**That paragraph answers a surprising number of questions.** Learn it cold.

---

# 3. THE DATA — the four things your app stores

Your database holds four main things. Everything else hangs off these.

**Organization** — a company. Just a name. This is the top-level container; everything belongs
to one organisation.

**User** — a person. Stores their name, email, hashed password, which organisation they belong
to, their role, plus profile details like department, job title and phone. Also a flag for
whether they must change their password on next login.

**Project** — a piece of work. Has a name, description, colour, status (active, paused,
completed or archived), tags, start and due dates, who created it, and **a list of members —
each with their own role inside that project**.

**Task** — one job inside a project. Has a title, description, a status (To Do, In Progress,
In Review, Done or Cancelled), a priority (Urgent, High, Medium or Low), who it's assigned to,
who created it, a due date, and a list of comments.

**How they connect:**
> "An organisation has many users and many projects. A project has many members and many tasks.
> A task belongs to one project and is assigned to one user. In the database I store the ID of
> the parent on each record — so every task stores which project it belongs to."

That last sentence is what a **relationship** means. You just explained database design.

---

# 4. YOUR BEST TALKING POINT — the two-level role system
### Lead with this. Most freshers have nothing this interesting to say.

Your app has roles at **two different levels**, and that is a genuinely good design decision.

**Level 1 — the system role.** Every user has one role for the whole organisation:
`admin`, `project_manager`, `team_lead`, or `member`.

**Level 2 — the project role.** Inside each individual project, a member has their *own* role
for that project: `project_manager`, `team_lead`, or `member`.

**Why that matters — this is the part to say out loud:**

> "The reason I did it at two levels is that in a real company, your seniority isn't the same
> everywhere. Someone might be a normal member of the organisation, but a team lead on one
> specific project. If I only had one role, I couldn't represent that. So the system role covers
> organisation-wide permissions, and the project role covers what you can do inside one
> particular project."

**And the admin rule:** an admin passes every permission check automatically, at both levels.

If you say only one technical thing on Monday, say this. It sounds like design thinking,
because it is.

---

# 5. THE THREE SECURITY GUARDS
### Say "guard" or "gate" — you don't have to say "middleware" unless you want to.

Picture a building with three checkpoints. A request has to get past the right ones.

**Guard 1 — "Who are you?"**
Checks the visitor is carrying a valid pass (the token). No pass, or a fake one, and they're
turned away immediately with a "not logged in" error. If the pass is good, the guard notes who
they are and waves them through.

**Guard 2 — "What's your rank in the company?"**
Checks the user's organisation-wide role. Used for things like creating a project. Admin always
passes.

**Guard 3 — "Are you on this project, and what's your role on it?"**
Loads the project, confirms the person is actually a member of it, and checks their role
*within that project*. Used for creating and deleting tasks.

> "Every protected route goes through the first guard, and then whichever extra guard that
> action needs. The guards run before the actual work happens, so if you're not allowed, the
> request stops there and never touches the database."

---

# 6. MULTI-TENANT — say this exactly

This is the second-strongest thing in your project. It sounds advanced and you genuinely did it.

> "Multi-tenant means several different companies use the same application and the same
> database, but each one can only ever see its own data.
>
> The way I did it: every user belongs to an organisation, and every project and task stores
> which organisation it belongs to. Then whenever I look something up, I don't just search by
> the record's ID — I search by the ID **and** the user's organisation together. So even if
> someone guessed another company's project ID and put it in the URL, the lookup wouldn't
> find it, because it doesn't belong to their organisation."

**If they look impressed and ask what that attack is called:** it's called **IDOR** — Insecure
Direct Object Reference. Changing an ID in a URL to try to see someone else's data.

---

# 7. THE LOGIN STORY — asked in almost every interview

Tell it as a story. No code needed.

> "The user types their email and password and presses login. That goes to my backend.
>
> The backend looks up the user by email. Passwords are never stored as real text — when someone
> registers, the password is scrambled one way using bcrypt, and that scramble is what's saved.
> So to check the login, it scrambles what they just typed and compares the two scrambles. If
> they don't match, or there's no such user, it sends back an error that deliberately doesn't
> say whether it was the email or the password that was wrong — so an attacker can't use it to
> discover which emails exist.
>
> If it matches, the server creates a token — a signed string that proves who you are — and
> sends it back. The frontend saves it in the browser, and from then on it attaches that token
> to every request. The first guard checks it each time."

**Follow-up: "what's a JWT?"**
> "It's that token. It has the user's ID inside it and it's signed by the server with a secret
> key. Anyone can read what's inside it, so I don't put anything sensitive in there — but nobody
> can change it, because if they did, the signature wouldn't match and the server would reject
> it."

**Follow-up: "why hash passwords?"**
> "So that if the database is ever stolen, the real passwords aren't in it. Hashing is one-way —
> you can't reverse it. Even I can't see a user's password."

---

# 8. THE OTHER SECURITY THINGS YOU DID

You genuinely have all of these. Mention two or three, not a list.

- **Rate limiting on login** — only a limited number of attempts in a 15-minute window, so
  nobody can sit there guessing passwords automatically.
- **Helmet** — sets protective headers on every response.
- **CORS allowlist** — only my own websites are allowed to call the API, not any random site.
- **Passwords hidden by default** — the password field isn't returned when you fetch a user;
  it has to be asked for explicitly, so it can't leak by accident.
- **Secrets in environment variables** — the database URL and the token secret aren't in the
  code, so they're not in GitHub.
- **Indexes** on the fields that are searched most, so lookups stay fast as data grows.

**The best line to say about security:**
> "The main thing I learned is that you can't trust the frontend. Hiding a button doesn't stop
> anyone — they can call the API directly. So every permission has to be checked again on the
> server, on every single request."

That sentence alone puts you ahead of most freshers.

---

# 9. THE 12 QUESTIONS AND YOUR ANSWERS
### Practise these out loud. Out loud, standing up. Not in your head.

**"What does your project do?"** → Section 1.

**"What technologies did you use?"**
> "React for the frontend, Node and Express for the backend, MongoDB for the database, and JWT
> for login. Deployed on Vercel with MongoDB Atlas."

**"Why did you choose MongoDB?"**
> "Mainly because the structure was still changing while I built it, and MongoDB doesn't force
> a fixed shape. Honestly, looking back, the data is quite relational — organisations, projects,
> tasks, users — so PostgreSQL would have been a reasonable choice too. That's one of the things
> I'm learning now."

*(Admitting this makes you sound thoughtful, not weak.)*

**"What was the hardest part?"**
> "The permissions. I first built them by just hiding buttons in the frontend, and then I
> realised anyone could call the API directly and do it anyway. So I had to redo it properly
> with checks on the server for every single route. That was the biggest thing I learned."

**"What is multi-tenant?"** → Section 6.

**"How does login work?"** → Section 7.

**"What are the roles?"** → Section 4.

**"What would you improve?"**
> "Three things. I haven't written automated tests yet — I tested by hand. I'd move the token
> out of browser storage into a more secure cookie. And I'd add real-time updates so the board
> refreshes for everyone without reloading the page."

**"What's a REST API?"**
> "It's a way of designing the URLs. Each type of thing has its own address — like /projects or
> /tasks — and what you're doing is decided by the method: GET to read, POST to create, PUT to
> update, DELETE to remove."

**"What is an index in a database?"**
> "It's like the index at the back of a book. Instead of reading every page to find something,
> the database can jump straight to it. I added them on the fields I search most, like which
> organisation and project a task belongs to."

**"How is it deployed?"**
> "The frontend and the API are both on Vercel, and the database is on MongoDB Atlas. The
> secrets are set in the Vercel dashboard rather than in the code."

**"What would you build next?"**
> "I want to build something with PostgreSQL, because I've only used MongoDB so far and most
> companies use SQL. Probably something smaller, and I want to write it without leaning on AI
> so I really understand every part."

---

# 10. THE HONEST ANSWER — prepare this, it's your safety net

You cannot read code fluently yet. There's a real chance they point at something and say
"what does this do?" **Prepare for that exact moment so it doesn't knock you over.**

**Do not volunteer a confession.** Don't walk in and announce you used AI. Lead with your
strengths — you can explain the architecture, the roles, the security. Most fresher interviews
never open the code at all.

**But if they ask directly — "did you build this yourself?" — tell the truth:**

> "I built it, and I used AI tools and documentation heavily while I was learning — the way
> people use Stack Overflow. I understand the architecture and what every part does, and I'm
> honest that I'm still going back through the code properly to understand it line by line.
> I'd rather tell you that than pretend."

**And if they point at code and you can't read it:**

> "I'd have to read through that carefully to be sure — I'm still working through the code at
> that level. But I can tell you what that part of the system does overall, if that helps."

Then explain the concept from this document. **You've given them something real instead of
freezing.**

**Why honesty is the right play, not just the moral one:** the alternative is bluffing, and a
bluff dies on the second follow-up. Once they catch one, they doubt everything else you said —
including the true parts. A fresher who admits a gap calmly is normal. A fresher caught
pretending is finished. And a small agency hiring at this level expects to train you; what
they're really screening for is whether you're honest and trainable.

**One thing you must not do: don't call yourself a fraud, and don't apologise repeatedly.**
Say the honest sentence once, calmly, then carry on. How you handle the gap is being judged far
more than the gap itself.

---

# 11. YOUR TWO DAYS

**Today (Saturday)** — read this document three times, slowly. Then close it and say Sections 1,
4, 6 and 7 out loud from memory. Standing. Record yourself once on your phone and listen back.

**Sunday morning** — the 12 questions in Section 9, out loud, no notes. Then open TeamFlow live
in the browser and physically click through it while narrating what's happening underneath:
"I'm logging in, so a token is coming back... now I'm opening a project, so it's checking I'm a
member of it..." Clicking while narrating locks it in far better than re-reading.

**Sunday afternoon** — `ATOZERV-COMPANY-BRIEF.md` and `INTERVIEW-ATOZERV.md` for the HR round,
the salary answer, the relocation answer, and the questions to ask them.

**Sunday night** — pack the bag, sleep 7+ hours. On Monday, composure is most of your score,
and tiredness takes composure first.

---

# THE LAST THING

You built a real, working, deployed application with multi-tenancy and a two-level permission
system. That exists. It runs. It's more than most people interviewing for this job will have.

You didn't understand it while you built it, and you're fixing that — starting this weekend,
and properly over the next few months. That's not fraud. That's just being earlier in the
process than you'd like to be.

On Monday you don't need to be a good developer. You need to be a **clear, honest person who
can explain what they made and is obviously willing to learn.** That you can do by Sunday night.

# Peer Tutoring & Study Group Matcher

SWE4040A (Software Construction and Development) group project — USIU-Africa, 2026 Fall.

Matches students who need help in a course ("tutees") with students able to
tutor that course, lets them book and manage sessions, and collects feedback
after each session. See [docs/01-group-project-discussion.md](docs/01-group-project-discussion.md)
for the project's scope, requirements process, design approach, and test plan,
and [docs/02-technical-plan.md](docs/02-technical-plan.md) for the technical
architecture and route map.

## Stack

- **Framework:** Next.js (App Router) + TypeScript — Server Components for reads,
  Server Actions for mutations (plain `<form action={...}>`, no hand-written fetch/JSON).
- **Styling:** Tailwind CSS.
- **Data store:** a JSON file (`data/db.json`, auto-created on first run, gitignored) —
  no native modules or external database needed, so `npm install` stays simple
  on any machine. Swap for a real database later without touching page/action logic much.
- **Auth:** email/password (bcrypt-hashed) with a JWT session in an httpOnly
  cookie (`jose`), following the pattern in Next.js's own Authentication guide
  (stateless sessions + a Data Access Layer in `lib/dal.ts`).

## Getting started

```bash
npm install
npm run dev
```

Then open **http://localhost:3000**.

The first account you register becomes an admin automatically (an "Admin" tab
appears), so there's no separate seed script to run.

For a production build:

```bash
npm run build
npm start
```

### Configuration

Copy `.env.example` to `.env` to override the session signing secret:

```
SESSION_SECRET=change-this-secret-in-production
```

## Project structure

```
app/
  layout.tsx, page.tsx        root layout + "/" redirect (to /login or /dashboard)
  login/, register/           auth pages (client forms using useActionState)
  actions/                    Server Actions: auth, tutors, requests, sessions, admin
  dashboard/
    layout.tsx                 protected layout: verifies session, renders TopNav
    page.tsx                   Find a Tutor (default tab)
    tutor/, requests/, sessions/, admin/   the other tabs
lib/
  db.ts                        JSON-file data store + types
  session.ts                   JWT encrypt/decrypt + cookie helpers (jose)
  dal.ts                       Data Access Layer: verifySession(), getCurrentUser(), requireAdmin()
  queries.ts                   read-side "views" (joins) used by the pages
  validation.ts                zod schemas for form input
components/
  top-nav.tsx, banner.tsx
proxy.ts                       optimistic auth redirect (Next 16's renamed middleware)
docs/
  01-group-project-discussion.md, 02-technical-plan.md, SWE4040A course outline PDF
```

## Core flows implemented

1. **Register / log in** as a student.
2. **Register as a tutor** for one or more courses (bio + availability).
3. **Browse tutors** for a course and **book a session** at a chosen time.
4. **Request help** for a course/topic (visible to tutors of that course).
5. **Manage sessions**: confirm, mark completed, or cancel; tutees can leave
   a 1–5 star rating + comment once a session is completed.
6. **Admin panel**: verify tutor profiles, view basic usage stats.

## Not yet implemented (future work)

- Automatic matching/notifications (currently students browse and pick manually).
- Password reset / email verification.
- Group (many-to-many) study sessions — sessions are currently 1-on-1.

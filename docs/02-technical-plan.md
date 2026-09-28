# Technical Plan: Peer Tutoring & Study Group Matcher

Follow-up to [01-group-project-discussion.md](01-group-project-discussion.md) — that doc covers the *what/why*; this one covers the *how* (stack, architecture, data model, route map) for the implementation.

## Stack

- **Framework:** Next.js (App Router) + TypeScript — a full-stack React framework, chosen over a separate Express API + vanilla-JS frontend so the UI and backend logic live in one project with server-rendered pages, typed end to end.
- **Styling:** Tailwind CSS.
- **Data store:** a JSON file (`data/db.json`, auto-created on first run, gitignored) read/written from server-only code — no native modules, so `npm install` stays simple on any machine. Swap for a real database later without touching the page/action logic much, since everything goes through `lib/db.ts`.
- **Auth:** email/password, bcrypt-hashed, session stored as a signed JWT (via `jose`) in an httpOnly cookie — following the pattern in Next.js's own Authentication guide (stateless sessions + a Data Access Layer).

## Why Next.js over the earlier Express + vanilla-JS build

The first pass (see git history) used Express for a REST API and a hand-written vanilla-JS single-page frontend calling it with `fetch`. That works, but duplicates a lot of plumbing (routes mirrored on both sides, manual JSON wiring, no server-rendering). Next.js's App Router lets Server Components read data directly (no API round-trip needed for reads) and Server Actions handle mutations directly from `<form>` elements (no hand-written fetch/JSON boilerplate), while still working with plain HTML forms if JavaScript is disabled.

## Architecture

```
app/
  layout.tsx                 root layout (fonts, globals.css)
  page.tsx                   "/" -> redirects to /login or /dashboard
  login/                     login page + client form (useActionState)
  register/                  register page + client form
  actions/                   Server Actions ("use server"): auth, tutors, requests, sessions, admin
  dashboard/
    layout.tsx                protected layout: verifies session, renders TopNav
    page.tsx                  Find a Tutor (default tab)
    tutor/page.tsx             Become a Tutor + my tutor profiles
    requests/page.tsx          Request Help + my requests
    sessions/page.tsx          My Sessions (confirm/complete/cancel/feedback)
    admin/page.tsx              Admin: verify tutors, usage stats
lib/
  db.ts                       JSON-file data store + types
  session.ts                  JWT encrypt/decrypt + cookie helpers (jose)
  dal.ts                      Data Access Layer: verifySession(), getCurrentUser(), requireAdmin()
  validation.ts                zod schemas for form input
components/
  top-nav.tsx                  client component (active-tab highlighting, logout)
proxy.ts                       optimistic redirect for /dashboard vs /login (Next 16's renamed middleware)
```

### Auth/session flow

1. Register/login Server Action validates input (zod), hashes/compares password (bcrypt), creates a JWT session (`{ userId, isAdmin }`) and sets it as an httpOnly cookie.
2. `lib/dal.ts`'s `verifySession()`/`getCurrentUser()` are called at the top of the protected layout and inside every Server Action that mutates data — this is the actual authorization boundary.
3. `proxy.ts` does a cheap, optimistic cookie check to redirect logged-out users away from `/dashboard/*` and logged-in users away from `/login`/`/register` before rendering — a UX nicety, not the security boundary.
4. First account ever registered becomes admin (no separate seed script needed).

## Data model (unchanged from the discussion doc's design)

- `User` — id, name, email, passwordHash, isAdmin, createdAt
- `Course` — id, code, name (seeded: SWE4040A, APT2080, CSC2201, MTH2101, STA2101)
- `TutorProfile` — id, userId, courseId, bio, availability, verified, createdAt
- `HelpRequest` — id, tuteeId, courseId, topic, preferredTimes, status (open/matched/closed)
- `Session` — id, tutorId, tuteeId, courseId, helpRequestId, scheduledTime, status (pending → confirmed → completed/cancelled)
- `Feedback` — id, sessionId, rating (1–5), comment

## Route map

| Route | Access | Purpose |
|---|---|---|
| `/` | public | redirects to `/dashboard` or `/login` |
| `/login`, `/register` | public | auth forms |
| `/dashboard` | authed | Find a Tutor (browse by course, book a session) |
| `/dashboard/tutor` | authed | Register/update a tutor profile, view own profiles |
| `/dashboard/requests` | authed | Post a help request, view own requests |
| `/dashboard/sessions` | authed | Manage booked sessions, leave feedback |
| `/dashboard/admin` | admin only | verify tutor profiles, view usage stats |

## Not yet implemented (future work)

- Automatic matching/notifications (students currently browse and pick manually).
- Password reset / email verification.
- Group (many-to-many) study sessions — sessions are currently 1-on-1.

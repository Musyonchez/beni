# Peer Tutoring & Study Group Matcher

SWE4040A (Software Construction and Development) group project — USIU-Africa, 2026 Fall.

Matches students who need help in a course ("tutees") with students able to
tutor that course, lets them book and manage sessions, and collects feedback
after each session. See [docs/01-group-project-discussion.md](docs/01-group-project-discussion.md)
for the project's scope, requirements process, design approach, and test plan.

## Stack

- **Backend:** Node.js + Express, REST API under `/api`
- **Data store:** a JSON file (`backend/data/db.json`, auto-created on first run) —
  no native modules or external database needed, so `npm install` stays simple
  on any machine. Swap for a real database later without touching route logic much.
- **Frontend:** plain HTML/CSS/JS (no build step), served by the same Express server
- **Auth:** email/password with bcrypt hashing + JWT

## Getting started

```bash
cd backend
npm install
npm start
```

Then open **http://localhost:3000**.

The first account you register becomes an admin automatically (visible via an
"Admin" tab), so there's no separate seed script to run.

For local development with auto-restart on file changes:

```bash
npm run dev
```

### Configuration

Copy `backend/.env.example` to `backend/.env` to override the port or JWT
secret:

```
PORT=3000
JWT_SECRET=change-this-secret-in-production
```

## Project structure

```
backend/
  server.js          Express app entrypoint, serves the API + frontend
  db.js              JSON-file data store (courses, users, tutors, requests, sessions, feedback)
  middleware/auth.js JWT auth + admin-only guard
  routes/            auth, courses, tutors, requests, sessions, admin
frontend/
  index.html, styles.css, app.js   vanilla JS single-page UI
docs/
  01-group-project-discussion.md  group discussion write-up
  SWE4040A course outline PDF
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

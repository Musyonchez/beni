// Fills data/db.json with demo data (users, tutors, requests, sessions, feedback).
// Run via `npm run seed`, or `./run.bat -Seed`. Stop the dev server first: it
// keeps the DB in memory and would overwrite this file on its next write.
//
// Refuses to touch an existing database that already has users, unless --force.
import fs from 'node:fs';
import path from 'node:path';
import bcrypt from 'bcryptjs';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');
const PASSWORD = 'Demo1234!';

const COURSES = [
  { code: 'SWE4040A', name: 'Software Construction and Development' },
  { code: 'APT2080', name: 'Introduction to Software Engineering' },
  { code: 'CSC2201', name: 'Data Structures and Algorithms' },
  { code: 'MTH2101', name: 'Calculus II' },
  { code: 'STA2101', name: 'Probability and Statistics' },
];

const force = process.argv.includes('--force');
if (fs.existsSync(DB_FILE) && !force) {
  const existing = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
  if (existing.users?.length > 0) {
    console.log('data/db.json already has users - skipping seed (use --force to wipe and reseed).');
    process.exit(0);
  }
}

const seq = { users: 1, courses: 1, tutorProfiles: 1, helpRequests: 1, sessions: 1, feedback: 1 };
const db = { seq, users: [], courses: [], tutorProfiles: [], helpRequests: [], sessions: [], feedback: [] };

const now = Date.now();
const iso = (offsetDays, hour = 14) => {
  const d = new Date(now + offsetDays * 86_400_000);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
};

const course = {};
for (const c of COURSES) {
  const row = { id: seq.courses++, ...c };
  db.courses.push(row);
  course[c.code] = row.id;
}

const passwordHash = bcrypt.hashSync(PASSWORD, 10);
const user = {};
function addUser(key, name, email, isAdmin = false) {
  const row = { id: seq.users++, name, email, passwordHash, isAdmin, createdAt: iso(-30) };
  db.users.push(row);
  user[key] = row.id;
}
addUser('admin', 'Demo Admin', 'admin@demo.test', true);
addUser('amina', 'Amina Wanjiru', 'amina@demo.test');
addUser('brian', 'Brian Otieno', 'brian@demo.test');
addUser('carol', 'Carol Njeri', 'carol@demo.test');
addUser('david', 'David Kimani', 'david@demo.test');
addUser('esther', 'Esther Achieng', 'esther@demo.test');

function addTutor(userKey, courseCode, bio, availability, verified) {
  db.tutorProfiles.push({
    id: seq.tutorProfiles++,
    userId: user[userKey],
    courseId: course[courseCode],
    bio,
    availability,
    verified,
    createdAt: iso(-20),
  });
}
addTutor('amina', 'SWE4040A', 'Final-year SWE student; built several Next.js projects. Happy to help with Git, testing and code structure.', 'Weekdays 4-6pm, Sat mornings', true);
addTutor('amina', 'CSC2201', 'Scored an A in Data Structures. I explain trees and graphs with diagrams.', 'Weekdays 4-6pm', true);
addTutor('brian', 'MTH2101', 'Maths tutor for two years. Integration techniques and series are my specialty.', 'Mon/Wed/Fri evenings', true);
addTutor('carol', 'STA2101', 'Stats major. Probability distributions and hypothesis testing made simple.', 'Tue/Thu afternoons', false);
addTutor('david', 'APT2080', 'Can walk you through requirements, UML and the SDLC.', 'Weekends', false);

function addRequest(tuteeKey, courseCode, topic, preferredTimes, status, daysAgo) {
  const row = {
    id: seq.helpRequests++,
    tuteeId: user[tuteeKey],
    courseId: course[courseCode],
    topic,
    preferredTimes,
    status,
    createdAt: iso(-daysAgo),
  };
  db.helpRequests.push(row);
  return row.id;
}
addRequest('esther', 'CSC2201', 'Understanding binary search trees and rotations', 'Weekday evenings', 'open', 2);
addRequest('david', 'MTH2101', 'Integration by parts and partial fractions', 'Weekends', 'open', 3);
const matchedReq = addRequest('carol', 'SWE4040A', 'Setting up unit tests and Git branching for our group project', 'Fri afternoon', 'matched', 6);
const closedReq = addRequest('esther', 'MTH2101', 'Series convergence tests', 'Mon evenings', 'closed', 15);

function addSession(tutorKey, tuteeKey, courseCode, helpRequestId, scheduledTime, status) {
  const row = {
    id: seq.sessions++,
    tutorId: user[tutorKey],
    tuteeId: user[tuteeKey],
    courseId: course[courseCode],
    helpRequestId,
    scheduledTime,
    status,
    createdAt: iso(-10),
  };
  db.sessions.push(row);
  return row.id;
}
addSession('amina', 'carol', 'SWE4040A', matchedReq, iso(2), 'confirmed');
addSession('brian', 'david', 'MTH2101', null, iso(4, 16), 'pending');
const doneSession = addSession('brian', 'esther', 'MTH2101', closedReq, iso(-12), 'completed');
addSession('amina', 'esther', 'CSC2201', null, iso(-8), 'cancelled');

db.feedback.push({
  id: seq.feedback++,
  sessionId: doneSession,
  rating: 5,
  comment: 'Brian explained the convergence tests clearly and gave great practice questions.',
  createdAt: iso(-11),
});

fs.mkdirSync(DATA_DIR, { recursive: true });
fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
console.log(`Seeded demo data into data/db.json. Log in with any of the emails below, password: ${PASSWORD}`);
for (const u of db.users) console.log(`  ${u.email}${u.isAdmin ? '  (admin)' : ''}`);

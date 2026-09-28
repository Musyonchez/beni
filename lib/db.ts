// Lightweight JSON-file "database" — no native modules, so `npm install`
// stays simple and reliable on any machine. Fine for a course-project MVP;
// swap for a real database later without touching page/action logic much,
// since everything reads/writes through the `db` object and save() here.
//
// NOTE: this relies on the local filesystem, so it only works for a
// single-process `next start`/`next dev` server, not multi-instance/
// serverless deployments (see docs/02-technical-plan.md).

import 'server-only';
import fs from 'node:fs';
import path from 'node:path';

export interface User {
  id: number;
  name: string;
  email: string;
  passwordHash: string;
  isAdmin: boolean;
  createdAt: string;
}

export interface Course {
  id: number;
  code: string;
  name: string;
}

export interface TutorProfile {
  id: number;
  userId: number;
  courseId: number;
  bio: string;
  availability: string;
  verified: boolean;
  createdAt: string;
}

export type HelpRequestStatus = 'open' | 'matched' | 'closed';

export interface HelpRequest {
  id: number;
  tuteeId: number;
  courseId: number;
  topic: string;
  preferredTimes: string;
  status: HelpRequestStatus;
  createdAt: string;
}

export type SessionStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface TutoringSession {
  id: number;
  tutorId: number;
  tuteeId: number;
  courseId: number;
  helpRequestId: number | null;
  scheduledTime: string;
  status: SessionStatus;
  createdAt: string;
}

export interface Feedback {
  id: number;
  sessionId: number;
  rating: number;
  comment: string;
  createdAt: string;
}

type Collection = 'users' | 'courses' | 'tutorProfiles' | 'helpRequests' | 'sessions' | 'feedback';

interface DBShape {
  seq: Record<Collection, number>;
  users: User[];
  courses: Course[];
  tutorProfiles: TutorProfile[];
  helpRequests: HelpRequest[];
  sessions: TutoringSession[];
  feedback: Feedback[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

const SEED_COURSES: Array<{ code: string; name: string }> = [
  { code: 'SWE4040A', name: 'Software Construction and Development' },
  { code: 'APT2080', name: 'Introduction to Software Engineering' },
  { code: 'CSC2201', name: 'Data Structures and Algorithms' },
  { code: 'MTH2101', name: 'Calculus II' },
  { code: 'STA2101', name: 'Probability and Statistics' },
];

function defaultData(): DBShape {
  return {
    seq: { users: 1, courses: 1, tutorProfiles: 1, helpRequests: 1, sessions: 1, feedback: 1 },
    users: [],
    courses: [],
    tutorProfiles: [],
    helpRequests: [],
    sessions: [],
    feedback: [],
  };
}

function load(): DBShape {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DB_FILE)) {
    const data = defaultData();
    for (const course of SEED_COURSES) {
      data.courses.push({ id: data.seq.courses++, ...course });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
    return data;
  }
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8')) as DBShape;
}

// Loaded once per server process and mutated in place; callers push/splice
// on the arrays below and call save() after each write. Next.js dev mode
// hot-reloads modules, so stash the instance on `globalThis` to avoid
// re-reading (and losing in-memory identity of) the file on every edit.
const globalForDb = globalThis as unknown as { __peerTutoringDb?: DBShape };
export const db: DBShape = globalForDb.__peerTutoringDb ?? (globalForDb.__peerTutoringDb = load());

export function save(): void {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

export function nextId(collection: Collection): number {
  return db.seq[collection]++;
}

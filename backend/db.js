// Lightweight JSON-file "database" — no native modules, so `npm install`
// stays simple and reliable across machines. Fine for a course-project MVP;
// swap for a real database later without touching the route handlers much,
// since they only talk to the `db` collections and `save()`/`nextId()` here.

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

const SEED_COURSES = [
  { code: 'SWE4040A', name: 'Software Construction and Development' },
  { code: 'APT2080', name: 'Introduction to Software Engineering' },
  { code: 'CSC2201', name: 'Data Structures and Algorithms' },
  { code: 'MTH2101', name: 'Calculus II' },
  { code: 'STA2101', name: 'Probability and Statistics' },
];

function defaultData() {
  return {
    seq: {
      users: 1,
      courses: 1,
      tutorProfiles: 1,
      helpRequests: 1,
      sessions: 1,
      feedback: 1,
    },
    users: [],
    courses: [],
    tutorProfiles: [],
    helpRequests: [],
    sessions: [],
    feedback: [],
  };
}

function load() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DB_FILE)) {
    const data = defaultData();
    for (const course of SEED_COURSES) {
      data.courses.push({ id: data.seq.courses++, ...course });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
    return data;
  }
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
}

// Loaded once per process and mutated in place; routes push/splice on the
// arrays below and call save() after each write.
const db = load();

function save() {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

function nextId(collection) {
  return db.seq[collection]++;
}

module.exports = { db, save, nextId };

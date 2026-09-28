const express = require('express');
const { db, save, nextId } = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

function withDetails(request) {
  const course = db.courses.find((c) => c.id === request.courseId);
  const tutee = db.users.find((u) => u.id === request.tuteeId);
  return {
    ...request,
    courseCode: course ? course.code : null,
    courseName: course ? course.name : null,
    tuteeName: tutee ? tutee.name : 'Unknown',
  };
}

router.post('/', requireAuth, (req, res) => {
  const { courseId, topic, preferredTimes } = req.body || {};
  const course = db.courses.find((c) => c.id === Number(courseId));
  if (!course) return res.status(400).json({ error: 'Unknown course' });
  if (!topic) return res.status(400).json({ error: 'topic is required' });

  const request = {
    id: nextId('helpRequests'),
    tuteeId: req.user.id,
    courseId: course.id,
    topic,
    preferredTimes: preferredTimes || '',
    status: 'open', // open -> matched -> closed
    createdAt: new Date().toISOString(),
  };
  db.helpRequests.push(request);
  save();
  res.status(201).json({ helpRequest: withDetails(request) });
});

router.get('/me', requireAuth, (req, res) => {
  const mine = db.helpRequests.filter((r) => r.tuteeId === req.user.id);
  res.json({ helpRequests: mine.map(withDetails) });
});

// Open requests, optionally scoped to a course — lets tutors see who to help.
router.get('/', requireAuth, (req, res) => {
  const { courseId } = req.query;
  let list = db.helpRequests.filter((r) => r.status === 'open');
  if (courseId) list = list.filter((r) => r.courseId === Number(courseId));
  res.json({ helpRequests: list.map(withDetails) });
});

module.exports = router;

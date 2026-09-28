const express = require('express');
const { db, save, nextId } = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

const ALLOWED_TRANSITIONS = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
};

function withDetails(session) {
  const tutor = db.users.find((u) => u.id === session.tutorId);
  const tutee = db.users.find((u) => u.id === session.tuteeId);
  const course = db.courses.find((c) => c.id === session.courseId);
  const feedback = db.feedback.find((f) => f.sessionId === session.id) || null;
  return {
    ...session,
    tutorName: tutor ? tutor.name : 'Unknown',
    tuteeName: tutee ? tutee.name : 'Unknown',
    courseCode: course ? course.code : null,
    courseName: course ? course.name : null,
    feedback,
  };
}

// Tutee books a session with a tutor who teaches that course.
router.post('/', requireAuth, (req, res) => {
  const { tutorId, courseId, scheduledTime, helpRequestId } = req.body || {};
  const course = db.courses.find((c) => c.id === Number(courseId));
  if (!course) return res.status(400).json({ error: 'Unknown course' });
  if (Number(tutorId) === req.user.id) {
    return res.status(400).json({ error: "You can't book a session with yourself" });
  }
  const tutorProfile = db.tutorProfiles.find(
    (p) => p.userId === Number(tutorId) && p.courseId === course.id
  );
  if (!tutorProfile) return res.status(400).json({ error: 'Tutor does not teach this course' });
  if (!scheduledTime) return res.status(400).json({ error: 'scheduledTime is required' });

  const session = {
    id: nextId('sessions'),
    tutorId: Number(tutorId),
    tuteeId: req.user.id,
    courseId: course.id,
    helpRequestId: helpRequestId ? Number(helpRequestId) : null,
    scheduledTime,
    status: 'pending', // pending -> confirmed -> completed | cancelled
    createdAt: new Date().toISOString(),
  };
  db.sessions.push(session);

  if (session.helpRequestId) {
    const request = db.helpRequests.find((r) => r.id === session.helpRequestId);
    if (request && request.tuteeId === req.user.id) request.status = 'matched';
  }
  save();
  res.status(201).json({ session: withDetails(session) });
});

router.get('/me', requireAuth, (req, res) => {
  const mine = db.sessions.filter(
    (s) => s.tutorId === req.user.id || s.tuteeId === req.user.id
  );
  res.json({ sessions: mine.map(withDetails) });
});

// Either participant can advance a session's status.
router.patch('/:id', requireAuth, (req, res) => {
  const session = db.sessions.find((s) => s.id === Number(req.params.id));
  if (!session) return res.status(404).json({ error: 'Session not found' });
  if (session.tutorId !== req.user.id && session.tuteeId !== req.user.id) {
    return res.status(403).json({ error: 'Not part of this session' });
  }
  const { status } = req.body || {};
  const allowedNext = ALLOWED_TRANSITIONS[session.status] || [];
  if (!allowedNext.includes(status)) {
    return res.status(400).json({ error: `Cannot move session from ${session.status} to ${status}` });
  }
  session.status = status;
  save();
  res.json({ session: withDetails(session) });
});

// Tutee leaves feedback once a session is completed.
router.post('/:id/feedback', requireAuth, (req, res) => {
  const session = db.sessions.find((s) => s.id === Number(req.params.id));
  if (!session) return res.status(404).json({ error: 'Session not found' });
  if (session.tuteeId !== req.user.id) {
    return res.status(403).json({ error: 'Only the tutee can leave feedback' });
  }
  if (session.status !== 'completed') {
    return res.status(400).json({ error: 'Session is not completed yet' });
  }
  if (db.feedback.find((f) => f.sessionId === session.id)) {
    return res.status(409).json({ error: 'Feedback already submitted for this session' });
  }
  const rating = Number((req.body || {}).rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'rating must be an integer from 1 to 5' });
  }

  const feedback = {
    id: nextId('feedback'),
    sessionId: session.id,
    rating,
    comment: (req.body || {}).comment || '',
    createdAt: new Date().toISOString(),
  };
  db.feedback.push(feedback);
  save();
  res.status(201).json({ feedback });
});

module.exports = router;

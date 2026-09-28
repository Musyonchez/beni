const express = require('express');
const { db, save } = require('../db');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth, requireAdmin);

router.get('/tutors', (req, res) => {
  const list = db.tutorProfiles.map((profile) => {
    const user = db.users.find((u) => u.id === profile.userId);
    const course = db.courses.find((c) => c.id === profile.courseId);
    return {
      ...profile,
      tutorName: user ? user.name : 'Unknown',
      tutorEmail: user ? user.email : null,
      courseCode: course ? course.code : null,
    };
  });
  res.json({ tutorProfiles: list });
});

router.post('/tutors/:id/verify', (req, res) => {
  const profile = db.tutorProfiles.find((p) => p.id === Number(req.params.id));
  if (!profile) return res.status(404).json({ error: 'Tutor profile not found' });
  profile.verified = (req.body || {}).verified !== false;
  save();
  res.json({ tutorProfile: profile });
});

router.get('/stats', (req, res) => {
  res.json({
    users: db.users.length,
    tutorProfiles: db.tutorProfiles.length,
    verifiedTutors: db.tutorProfiles.filter((p) => p.verified).length,
    helpRequests: db.helpRequests.length,
    openRequests: db.helpRequests.filter((r) => r.status === 'open').length,
    sessions: db.sessions.length,
    completedSessions: db.sessions.filter((s) => s.status === 'completed').length,
  });
});

module.exports = router;

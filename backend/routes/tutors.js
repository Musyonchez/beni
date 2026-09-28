const express = require('express');
const { db, save, nextId } = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

function withDetails(profile) {
  const user = db.users.find((u) => u.id === profile.userId);
  const course = db.courses.find((c) => c.id === profile.courseId);
  const ratings = db.feedback.filter((f) => {
    const session = db.sessions.find((s) => s.id === f.sessionId);
    return session && session.tutorId === profile.userId && session.courseId === profile.courseId;
  });
  const avgRating = ratings.length
    ? Math.round((ratings.reduce((sum, f) => sum + f.rating, 0) / ratings.length) * 10) / 10
    : null;

  return {
    ...profile,
    tutorName: user ? user.name : 'Unknown',
    courseCode: course ? course.code : null,
    courseName: course ? course.name : null,
    avgRating,
    ratingCount: ratings.length,
  };
}

// Create or update the caller's own tutor profile for a course.
router.post('/', requireAuth, (req, res) => {
  const { courseId, bio, availability } = req.body || {};
  const course = db.courses.find((c) => c.id === Number(courseId));
  if (!course) return res.status(400).json({ error: 'Unknown course' });
  if (!availability) return res.status(400).json({ error: 'availability is required' });

  let profile = db.tutorProfiles.find(
    (p) => p.userId === req.user.id && p.courseId === course.id
  );
  if (profile) {
    profile.bio = bio ?? profile.bio;
    profile.availability = availability;
  } else {
    profile = {
      id: nextId('tutorProfiles'),
      userId: req.user.id,
      courseId: course.id,
      bio: bio || '',
      availability,
      verified: false,
      createdAt: new Date().toISOString(),
    };
    db.tutorProfiles.push(profile);
  }
  save();
  res.status(201).json({ tutorProfile: withDetails(profile) });
});

router.get('/me', requireAuth, (req, res) => {
  const mine = db.tutorProfiles.filter((p) => p.userId === req.user.id);
  res.json({ tutorProfiles: mine.map(withDetails) });
});

// Browse tutors, optionally filtered by course.
router.get('/', (req, res) => {
  const { courseId, verifiedOnly } = req.query;
  let list = db.tutorProfiles;
  if (courseId) list = list.filter((p) => p.courseId === Number(courseId));
  if (verifiedOnly === 'true') list = list.filter((p) => p.verified);
  res.json({ tutorProfiles: list.map(withDetails) });
});

module.exports = router;

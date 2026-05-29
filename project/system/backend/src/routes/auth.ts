import { Router } from 'express';

const router = Router();

// POST /api/auth/register
router.post('/register', (_req, res) => {
  res.status(501).json({ message: 'Not implemented' });
});

// POST /api/auth/login
router.post('/login', (_req, res) => {
  res.status(501).json({ message: 'Not implemented' });
});

// GET /api/auth/me
router.get('/me', (_req, res) => {
  res.status(501).json({ message: 'Not implemented' });
});

// PUT /api/auth/me
router.put('/me', (_req, res) => {
  res.status(501).json({ message: 'Not implemented' });
});

// PUT /api/auth/password
router.put('/password', (_req, res) => {
  res.status(501).json({ message: 'Not implemented' });
});

export default router;

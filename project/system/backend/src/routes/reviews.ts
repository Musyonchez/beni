import { Router } from 'express';

const router = Router();

router.post('/', (_req, res) => res.status(501).json({ message: 'Not implemented' }));
router.get('/farmer/:farmerId', (_req, res) => res.status(501).json({ message: 'Not implemented' }));
router.get('/farmer/:farmerId/rating', (_req, res) => res.status(501).json({ message: 'Not implemented' }));

export default router;

import { Router } from 'express';

const router = Router();

router.post('/initiate', (_req, res) => res.status(501).json({ message: 'Not implemented' }));
router.post('/callback', (_req, res) => res.status(501).json({ message: 'Not implemented' }));
router.get('/status/:orderId', (_req, res) => res.status(501).json({ message: 'Not implemented' }));

export default router;

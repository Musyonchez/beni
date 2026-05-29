import { Router } from 'express';

const router = Router();

router.post('/', (_req, res) => res.status(501).json({ message: 'Not implemented' }));
router.get('/my', (_req, res) => res.status(501).json({ message: 'Not implemented' }));
router.get('/farmer', (_req, res) => res.status(501).json({ message: 'Not implemented' }));
router.get('/:id', (_req, res) => res.status(501).json({ message: 'Not implemented' }));
router.put('/:id/status', (_req, res) => res.status(501).json({ message: 'Not implemented' }));
router.put('/:id/cancel', (_req, res) => res.status(501).json({ message: 'Not implemented' }));

export default router;

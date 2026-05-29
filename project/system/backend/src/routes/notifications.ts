import { Router } from 'express';

const router = Router();

router.get('/', (_req, res) => res.status(501).json({ message: 'Not implemented' }));
router.put('/:id/read', (_req, res) => res.status(501).json({ message: 'Not implemented' }));
router.put('/read-all', (_req, res) => res.status(501).json({ message: 'Not implemented' }));

export default router;

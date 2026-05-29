import { Router } from 'express';

const router = Router();

router.get('/', (_req, res) => res.status(501).json({ message: 'Not implemented' }));
router.get('/nearby', (_req, res) => res.status(501).json({ message: 'Not implemented' }));
router.get('/my', (_req, res) => res.status(501).json({ message: 'Not implemented' }));
router.get('/:id', (_req, res) => res.status(501).json({ message: 'Not implemented' }));
router.post('/', (_req, res) => res.status(501).json({ message: 'Not implemented' }));
router.put('/:id', (_req, res) => res.status(501).json({ message: 'Not implemented' }));
router.delete('/:id', (_req, res) => res.status(501).json({ message: 'Not implemented' }));

export default router;

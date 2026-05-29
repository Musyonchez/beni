import { Router } from 'express';

const router = Router();

router.get('/users', (_req, res) => res.status(501).json({ message: 'Not implemented' }));
router.put('/users/:id/verify', (_req, res) => res.status(501).json({ message: 'Not implemented' }));
router.delete('/users/:id', (_req, res) => res.status(501).json({ message: 'Not implemented' }));
router.get('/products', (_req, res) => res.status(501).json({ message: 'Not implemented' }));
router.delete('/products/:id', (_req, res) => res.status(501).json({ message: 'Not implemented' }));
router.get('/reports/sales', (_req, res) => res.status(501).json({ message: 'Not implemented' }));
router.get('/reports/users', (_req, res) => res.status(501).json({ message: 'Not implemented' }));

export default router;

import { Router } from 'express';
import healthRouter from '../modules/health/health.router';
import authRouter from '../modules/auth/auth.router';
import { requireAuth } from '../middleware/auth';

const router = Router();

/**
 * Mount versioned API routes.
 * All business feature routes will be registered here under /api/v1.
 */

router.use('/auth', authRouter);

// Temporary test route to verify auth middleware
router.get('/test-protected', requireAuth, (req, res) => {
  res.status(200).json({ data: { user: req.user } });
});

export { healthRouter };
export default router;

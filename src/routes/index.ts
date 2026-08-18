import { Router } from 'express';
import healthRouter from '../modules/health/health.router';

const router = Router();

/**
 * Mount versioned API routes.
 * All business feature routes will be registered here under /api/v1.
 */

// Placeholder — business routes (auth, employees, salaries, analytics) will be added in later phases.

export { healthRouter };
export default router;

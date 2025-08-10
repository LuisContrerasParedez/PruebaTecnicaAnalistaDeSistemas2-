// src/routes/health.routes.js
import { Router } from 'express';
import { prisma } from '../lib/prisma.js';

const router = Router();

/**
 * @openapi
 * /health:
 *   get:
 *     tags: [Health]
 *     summary: Health check
 */
router.get('/health', (_req, res) => res.json({ ok: true }));

/**
 * @openapi
 * /health/db:
 *   get:
 *     tags: [Health]
 *     summary: DB health check
 */
router.get('/health/db', async (_req, res) => {
  try {
    const [{ ok }] = await prisma.$queryRaw`SELECT CAST(1 AS INT) AS ok`;
    res.json({ ok: true, db: ok === 1 });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

export default router;

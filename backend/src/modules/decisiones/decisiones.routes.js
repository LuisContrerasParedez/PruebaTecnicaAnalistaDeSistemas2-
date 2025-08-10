import { Router } from 'express';
import * as ctrl from './decisiones.controller.js';
import { validate } from '../../middlewares/validate.js';
import { listSchema, getByIdSchema } from './decisiones.schemas.js';

const router = Router();

/**
 * @openapi
 * /decisiones:
 *   get:
 *     tags:
 *       - Decisiones
 *     summary: Listar decisiones (filtros opcionales)
 *     parameters:
 *       - in: query
 *         name: expedienteId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: tipo
 *         schema:
 *           type: string
 *           enum:
 *             - Aprobado
 *             - Rechazado
 *       - in: query
 *         name: desde
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: hasta
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: decididoPor
 *         schema:
 *           type: integer
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *           minimum: 1
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 20
 *           minimum: 1
 *           maximum: 200
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/', validate(listSchema), ctrl.list);

/**
 * @openapi
 * /decisiones/{id}:
 *   get:
 *     tags:
 *       - Decisiones
 *     summary: Obtener decisión por id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: OK
 *       404:
 *         description: No encontrado
 */
router.get('/:id', validate(getByIdSchema), ctrl.getById);

export default router;

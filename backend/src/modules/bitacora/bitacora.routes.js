import { Router } from 'express';
import * as ctrl from './bitacora.controller.js';
import { validate } from '../../middlewares/validate.js';
import { listSchema, getByIdSchema, addSchema } from './bitacora.schemas.js';

const router = Router();

/**
 * @openapi
 * /bitacora:
 *   get:
 *     tags:
 *       - Bitácora
 *     summary: Listar eventos de bitácora
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *       - in: query
 *         name: entidad
 *         schema:
 *           type: string
 *       - in: query
 *         name: entidadId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: usuarioId
 *         schema:
 *           type: integer
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
 * /bitacora/{id}:
 *   get:
 *     tags:
 *       - Bitácora
 *     summary: Obtener evento de bitácora por id
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

/**
 * @openapi
 * /bitacora:
 *   post:
 *     tags:
 *       - Bitácora
 *     summary: Crear evento de bitácora (uso interno / pruebas)
 *     parameters:
 *       - in: header
 *         name: X-User-Id
 *         required: false
 *         schema:
 *           type: integer
 *         description: Id del usuario (solo pruebas sin auth)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BitacoraCreate'
 *     responses:
 *       201:
 *         description: Creado
 */
router.post('/', validate(addSchema), ctrl.add);

export default router;

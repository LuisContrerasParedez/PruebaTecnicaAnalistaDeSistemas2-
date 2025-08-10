import { Router } from 'express';
import * as ctrl from './indicios.controller.js';
import { validate } from '../../middlewares/validate.js';
import { listSchema, getByIdSchema, createSchema, updateSchema } from './indicios.schemas.js';

const router = Router();

/**
 * @openapi
 * /indicios:
 *   get:
 *     tags:
 *       - Indicios
 *     summary: Listar indicios por expediente
 *     parameters:
 *       - in: query
 *         name: expedienteId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *       - in: query
 *         name: tipo
 *         schema:
 *           type: string
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
 * /indicios/{id}:
 *   get:
 *     tags:
 *       - Indicios
 *     summary: Obtener indicio por id
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
 * /indicios:
 *   post:
 *     tags:
 *       - Indicios
 *     summary: Crear indicio
 *     parameters:
 *       - in: header
 *         name: X-User-Id
 *         required: false
 *         schema:
 *           type: integer
 *         description: Id del técnico (solo para pruebas sin auth)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/IndicioCreate'
 *     responses:
 *       201:
 *         description: Creado
 */
router.post('/', validate(createSchema), ctrl.create);

/**
 * @openapi
 * /indicios/{id}:
 *   patch:
 *     tags:
 *       - Indicios
 *     summary: Actualizar indicio
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/IndicioUpdate'
 *     responses:
 *       200:
 *         description: OK
 */
router.patch('/:id', validate(updateSchema), ctrl.update);

/**
 * @openapi
 * /indicios/{id}:
 *   delete:
 *     tags:
 *       - Indicios
 *     summary: Eliminar indicio (solo si el expediente no está EnRevision/Aprobado)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: OK
 */
router.delete('/:id', ctrl.remove);

export default router;

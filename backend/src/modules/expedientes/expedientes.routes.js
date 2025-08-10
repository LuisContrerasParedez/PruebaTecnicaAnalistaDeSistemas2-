import { Router } from 'express';
import * as ctrl from './expedientes.controller.js';
import { validate } from '../../middlewares/validate.js';
import {
  listSchema, getByIdSchema, createSchema, updateSchema,
  sendToReviewSchema, approveSchema, rejectSchema
} from './expedientes.schemas.js';

const router = Router();

/**
 * @openapi
 * /expedientes:
 *   get:
 *     tags:
 *       - Expedientes
 *     summary: Listar expedientes
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum:
 *             - Borrador
 *             - EnRevision
 *             - Rechazado
 *             - Aprobado
 *       - in: query
 *         name: desde
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: hasta
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: tecnicoId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: coordinadorId
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
 * /expedientes/{id}:
 *   get:
 *     tags:
 *       - Expedientes
 *     summary: Obtener expediente por id
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
 * /expedientes:
 *   post:
 *     tags:
 *       - Expedientes
 *     summary: Crear expediente (estado inicial Borrador)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ExpedienteCreate'
 *     responses:
 *       201:
 *         description: Creado
 */
router.post('/', validate(createSchema), ctrl.create);

/**
 * @openapi
 * /expedientes/{id}:
 *   patch:
 *     tags:
 *       - Expedientes
 *     summary: Actualizar expediente (solo Borrador/Rechazado)
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
 *             $ref: '#/components/schemas/ExpedienteUpdate'
 *     responses:
 *       200:
 *         description: OK
 */
router.patch('/:id', validate(updateSchema), ctrl.update);

/**
 * @openapi
 * /expedientes/{id}/enviar-revision:
 *   post:
 *     tags:
 *       - Expedientes
 *     summary: Enviar a revisión (requiere al menos 1 indicio)
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
 *             $ref: '#/components/schemas/ExpedienteSendToReview'
 *     responses:
 *       200:
 *         description: OK
 */
router.post('/:id/enviar-revision', validate(sendToReviewSchema), ctrl.sendToReview);

/**
 * @openapi
 * /expedientes/{id}/aprobar:
 *   post:
 *     tags:
 *       - Expedientes
 *     summary: Aprobar expediente (solo EnRevision)
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
router.post('/:id/aprobar', validate(approveSchema), ctrl.approve);

/**
 * @openapi
 * /expedientes/{id}/rechazar:
 *   post:
 *     tags:
 *       - Expedientes
 *     summary: Rechazar expediente con justificación (solo EnRevision)
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
 *             $ref: '#/components/schemas/ExpedienteReject'
 *     responses:
 *       200:
 *         description: OK
 */
router.post('/:id/rechazar', validate(rejectSchema), ctrl.reject);

export default router;

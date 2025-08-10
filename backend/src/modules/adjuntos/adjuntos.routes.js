import { Router } from 'express';
import * as ctrl from './adjuntos.controller.js';
import { validate } from '../../middlewares/validate.js';
import { listSchema, getByIdSchema, createSchema, updateSchema } from './adjuntos.schemas.js';

const router = Router();

/**
 * @openapi
 * /adjuntos:
 *   get:
 *     tags:
 *       - Adjuntos
 *     summary: Listar adjuntos por entidad
 *     parameters:
 *       - in: query
 *         name: entidad
 *         required: true
 *         schema:
 *           type: string
 *           enum: [EXPEDIENTE, INDICIO, USUARIO]
 *       - in: query
 *         name: entidadId
 *         required: true
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
 * /adjuntos/{id}:
 *   get:
 *     tags:
 *       - Adjuntos
 *     summary: Obtener adjunto por id
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
 * /adjuntos:
 *   post:
 *     tags:
 *       - Adjuntos
 *     summary: Registrar metadatos de adjunto (no sube archivo)
 *     parameters:
 *       - in: header
 *         name: X-User-Id
 *         required: false
 *         schema:
 *           type: integer
 *         description: Id de usuario que sube (solo para pruebas sin auth)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AdjuntoCreate'
 *     responses:
 *       201:
 *         description: Creado
 */
router.post('/', validate(createSchema), ctrl.create);

/**
 * @openapi
 * /adjuntos/{id}:
 *   patch:
 *     tags:
 *       - Adjuntos
 *     summary: Actualizar metadatos del adjunto
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
 *             $ref: '#/components/schemas/AdjuntoUpdate'
 *     responses:
 *       200:
 *         description: OK
 */
router.patch('/:id', validate(updateSchema), ctrl.update);

/**
 * @openapi
 * /adjuntos/{id}:
 *   delete:
 *     tags:
 *       - Adjuntos
 *     summary: Eliminar adjunto
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

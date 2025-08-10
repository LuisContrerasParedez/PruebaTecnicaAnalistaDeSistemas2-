import { Router } from 'express';
import * as ctrl from './roles.controller.js';
import { validate } from '../../middlewares/validate.js';
import { listSchema, getByIdSchema, createSchema, updateSchema } from './roles.schemas.js';

const router = Router();

/**
 * @openapi
 * /roles:
 *   get:
 *     tags: [Roles]
 *     summary: Listar roles
 *     parameters:
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1, minimum: 1 }
 *       - in: query
 *         name: pageSize
 *         schema: { type: integer, default: 20, minimum: 1, maximum: 200 }
 *     responses:
 *       200: { description: OK }
 */
router.get('/', validate(listSchema), ctrl.list);

/**
 * @openapi
 * /roles/{id}:
 *   get:
 *     tags: [Roles]
 *     summary: Obtener rol por id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, minimum: 1 }
 *     responses:
 *       200: { description: OK }
 *       404: { description: No encontrado }
 */
router.get('/:id', validate(getByIdSchema), ctrl.getById);

/**
 * @openapi
 * /roles:
 *   post:
 *     tags: [Roles]
 *     summary: Crear rol
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RolCreate'
 *     responses:
 *       201: { description: Creado }
 */
router.post('/', validate(createSchema), ctrl.create);

/**
 * @openapi
 * /roles/{id}:
 *   patch:
 *     tags: [Roles]
 *     summary: Actualizar rol
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, minimum: 1 }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RolUpdate'
 *     responses:
 *       200: { description: OK }
 */
router.patch('/:id', validate(updateSchema), ctrl.update);

/**
 * @openapi
 * /roles/{id}:
 *   delete:
 *     tags: [Roles]
 *     summary: Eliminar rol (falla si está en uso por usuarios)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, minimum: 1 }
 *     responses:
 *       200: { description: OK }
 */
router.delete('/:id', ctrl.remove);

export default router;

import { Router } from 'express';
import * as ctrl from './catalogo.controller.js';
import { validate } from '../../middlewares/validate.js';
import { listSchema, getByIdSchema, createSchema, updateSchema, setActivoSchema } from './catalogo.schemas.js';

const router = Router();

/**
 * @openapi
 * /catalogos:
 *   get:
 *     tags: [Catálogos]
 *     summary: Listar catálogos
 *     parameters:
 *       - in: query
 *         name: tipo
 *         schema: { type: string }
 *       - in: query
 *         name: q
 *         schema: { type: string, description: "Busca en valor" }
 *       - in: query
 *         name: activo
 *         schema: { type: boolean }
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
 * /catalogos/{id}:
 *   get:
 *     tags: [Catálogos]
 *     summary: Obtener item de catálogo
 *     parameters: [{ in: path, name: id, required: true, schema: { type: integer, minimum: 1 } }]
 *     responses:
 *       200: { description: OK }
 *       404: { description: No encontrado }
 */
router.get('/:id', validate(getByIdSchema), ctrl.getById);

/**
 * @openapi
 * /catalogos:
 *   post:
 *     tags: [Catálogos]
 *     summary: Crear item de catálogo
 *     requestBody:
 *       required: true
 *       content: { application/json: { schema: { $ref: '#/components/schemas/CatalogoCreate' } } }
 *     responses:
 *       201: { description: Creado }
 */
router.post('/', validate(createSchema), ctrl.create);

/**
 * @openapi
 * /catalogos/{id}:
 *   patch:
 *     tags: [Catálogos]
 *     summary: Actualizar item de catálogo
 *     parameters: [{ in: path, name: id, required: true, schema: { type: integer, minimum: 1 } }]
 *     requestBody:
 *       required: true
 *       content: { application/json: { schema: { $ref: '#/components/schemas/CatalogoUpdate' } } }
 *     responses:
 *       200: { description: OK }
 */
router.patch('/:id', validate(updateSchema), ctrl.update);

/**
 * @openapi
 * /catalogos/{id}/activo:
 *   patch:
 *     tags: [Catálogos]
 *     summary: Activar/Desactivar item
 *     parameters: [{ in: path, name: id, required: true, schema: { type: integer, minimum: 1 } }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [activo]
 *             properties: { activo: { type: boolean } }
 *     responses:
 *       200: { description: OK }
 */
router.patch('/:id/activo', validate(setActivoSchema), ctrl.setActivo);

/**
 * @openapi
 * /catalogos/{id}:
 *   delete:
 *     tags: [Catálogos]
 *     summary: Eliminar item de catálogo
 *     parameters: [{ in: path, name: id, required: true, schema: { type: integer, minimum: 1 } }]
 *     responses:
 *       200: { description: OK }
 */
router.delete('/:id', ctrl.remove);

export default router;

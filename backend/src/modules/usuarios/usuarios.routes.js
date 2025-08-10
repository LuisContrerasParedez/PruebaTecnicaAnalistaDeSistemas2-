// src/modules/usuarios/usuarios.routes.js
import { Router } from 'express';
import * as ctrl from './usuarios.controller.js';
import { validate } from '../../middlewares/validate.js';
import {
  listSchema, createSchema, updateSchema,
  setPasswordSchema, setActivoSchema, getByIdSchema
} from './usuarios.schemas.js';

const router = Router();

/**
 * @openapi
 * /usuarios:
 *   get:
 *     tags: [Usuarios]
 *     summary: Listar usuarios (paginado)
 *     parameters:
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *         description: Búsqueda por nombre o correo
 *       - in: query
 *         name: activo
 *         schema: { type: boolean }
 *         description: true/false
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1, minimum: 1 }
 *       - in: query
 *         name: pageSize
 *         schema: { type: integer, default: 20, minimum: 1, maximum: 200 }
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Usuario' }
 */
router.get('/', validate(listSchema), ctrl.list);

/**
 * @openapi
 * /usuarios/{id}:
 *   get:
 *     tags: [Usuarios]
 *     summary: Obtener usuario por id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, minimum: 1 }
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Usuario' }
 *       404: { description: No encontrado }
 */
router.get('/:id', validate(getByIdSchema), ctrl.getById);

/**
 * @openapi
 * /usuarios:
 *   post:
 *     tags: [Usuarios]
 *     summary: Crear usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/UsuarioCreate' }
 *     responses:
 *       201:
 *         description: Creado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Usuario' }
 *       409: { description: Correo ya existe }
 */
router.post('/', validate(createSchema), ctrl.create);

/**
 * @openapi
 * /usuarios/{id}:
 *   patch:
 *     tags: [Usuarios]
 *     summary: Actualizar usuario
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, minimum: 1 }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/UsuarioUpdate' }
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Usuario' }
 */
router.patch('/:id', validate(updateSchema), ctrl.update);

/**
 * @openapi
 * /usuarios/{id}/activo:
 *   patch:
 *     tags: [Usuarios]
 *     summary: Activar/Desactivar usuario
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
 *             type: object
 *             required: [activo]
 *             properties:
 *               activo: { type: boolean }
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Usuario' }
 */
router.patch('/:id/activo', validate(setActivoSchema), ctrl.setActivo);

/**
 * @openapi
 * /usuarios/{id}/password:
 *   patch:
 *     tags: [Usuarios]
 *     summary: Establecer/Resetear contraseña
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, minimum: 1 }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/UsuarioSetPassword' }
 *     responses:
 *       200: { description: OK }
 */
router.patch('/:id/password', validate(setPasswordSchema), ctrl.setPassword);

/**
 * @openapi
 * /usuarios/{id}:
 *   delete:
 *     tags: [Usuarios]
 *     summary: Inactivar usuario (soft delete)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, minimum: 1 }
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Usuario' }
 */
router.delete('/:id', ctrl.remove);

export default router;

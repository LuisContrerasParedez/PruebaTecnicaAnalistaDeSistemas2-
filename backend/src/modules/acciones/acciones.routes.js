// src/modules/acciones/acciones.routes.js
import { Router } from 'express';
import { listar, obtener, crear, actualizar, eliminar } from './acciones.controller.js';
import { validarBody, validarParams } from '../../middlewares/validar.middleware.js';
import { idParamSchema, crearAccionSchema, actualizarAccionSchema } from './acciones.schemas.js';

const router = Router();

/**
 * @openapi
 * tags:
 *   - name: Acciones
 *     description: API para gestionar acciones
 */

/**
 * @openapi
 * /acciones:
 *   get:
 *     tags: [Acciones]
 *     summary: Listar todas las acciones
 *     responses:
 *       200:
 *         description: Lista de acciones
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Accion'
 *   post:
 *     tags: [Acciones]
 *     summary: Crear una nueva acción
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AccionCreate'
 *     responses:
 *       201:
 *         description: Acción creada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Accion'
 */

/**
 * @openapi
 * /acciones/{id}:
 *   get:
 *     tags: [Acciones]
 *     summary: Obtener una acción por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Acción encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Accion'
 *       404: { description: No encontrado }
 *   put:
 *     tags: [Acciones]
 *     summary: Actualizar una acción
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AccionUpdate'
 *     responses:
 *       200: { description: Actualizada }
 *       404: { description: No encontrado }
 *   delete:
 *     tags: [Acciones]
 *     summary: Eliminar una acción
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204: { description: Eliminada }
 *       404: { description: No encontrado }
 */

router
  .get('/', listar)
  .get('/:id', validarParams(idParamSchema), obtener)
  .post('/', validarBody(crearAccionSchema), crear)
  .put('/:id', validarParams(idParamSchema), validarBody(actualizarAccionSchema), actualizar)
  .delete('/:id', validarParams(idParamSchema), eliminar);

export default router;

import { Router } from 'express';
import { listar, obtener, crear, actualizar, eliminar } from '../controllers/acciones.controller.js';

const r = Router();

/**
 * @swagger
 * tags:
 *   name: Acciones
 *   description: API para gestionar acciones
 */

/**
 * @swagger
 * /acciones:
 *   get:
 *     summary: Listar todas las acciones
 *     tags: [Acciones]
 *     responses:
 *       200:
 *         description: Lista de acciones
 */
r.get('/', listar);

/**
 * @swagger
 * /acciones/{id}:
 *   get:
 *     summary: Obtener una acción por su ID
 *     tags: [Acciones]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Datos de la acción
 *       404:
 *         description: No encontrado
 */
r.get('/:id', obtener);

/**
 * @swagger
 * /acciones:
 *   post:
 *     summary: Crear una nueva acción
 *     tags: [Acciones]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: "Nueva acción"
 *               descripcion:
 *                 type: string
 *                 example: "Descripción opcional"
 *     responses:
 *       201:
 *         description: Acción creada exitosamente
 */
r.post('/', crear);

/**
 * @swagger
 * /acciones/{id}:
 *   put:
 *     summary: Actualizar una acción existente
 *     tags: [Acciones]
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
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: "Acción modificada"
 *               descripcion:
 *                 type: string
 *                 example: "Descripción modificada"
 *     responses:
 *       200:
 *         description: Acción actualizada
 *       404:
 *         description: No encontrado
 */
r.put('/:id', actualizar);

/**
 * @swagger
 * /acciones/{id}:
 *   delete:
 *     summary: Eliminar una acción
 *     tags: [Acciones]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Acción eliminada
 *       404:
 *         description: No encontrado
 */
r.delete('/:id', eliminar);

export default r;

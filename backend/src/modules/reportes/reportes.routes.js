import { Router } from 'express';
import { validate } from '../../middlewares/validate.js';
import {
  expResumenSchema, expDetalleSchema, expSerieSchema,
  indiciosPorExpedienteSchema, rechazosMotivosSchema
} from './reportes.schemas.js';
import * as ctrl from './reportes.controller.js';

const router = Router();

/**
 * @openapi
 * /reportes/expedientes/resumen:
 *   get:
 *     tags:
 *       - Reportes
 *     summary: Resumen de expedientes por estado
 *     parameters:
 *       - in: query
 *         name: desde
 *         schema: { type: string, format: date-time }
 *       - in: query
 *         name: hasta
 *         schema: { type: string, format: date-time }
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [Borrador, EnRevision, Rechazado, Aprobado]
 *       - in: query
 *         name: unidad
 *         schema: { type: string }
 *       - in: query
 *         name: tecnicoId
 *         schema: { type: integer }
 *       - in: query
 *         name: coordinadorId
 *         schema: { type: integer }
 *     responses:
 *       200: { description: OK }
 */
router.get('/expedientes/resumen', validate(expResumenSchema), ctrl.expResumen);

/**
 * @openapi
 * /reportes/expedientes/detalle:
 *   get:
 *     tags:
 *       - Reportes
 *     summary: Detalle de expedientes (paginado)
 *     parameters:
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *       - in: query
 *         name: desde
 *         schema: { type: string, format: date-time }
 *       - in: query
 *         name: hasta
 *         schema: { type: string, format: date-time }
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [Borrador, EnRevision, Rechazado, Aprobado]
 *       - in: query
 *         name: unidad
 *         schema: { type: string }
 *       - in: query
 *         name: tecnicoId
 *         schema: { type: integer }
 *       - in: query
 *         name: coordinadorId
 *         schema: { type: integer }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1, minimum: 1 }
 *       - in: query
 *         name: pageSize
 *         schema: { type: integer, default: 50, minimum: 1, maximum: 500 }
 *     responses:
 *       200: { description: OK }
 */
router.get('/expedientes/detalle', validate(expDetalleSchema), ctrl.expDetalle);

/**
 * @openapi
 * /reportes/expedientes/detalle.csv:
 *   get:
 *     tags:
 *       - Reportes
 *     summary: Exportar detalle de expedientes a CSV
 *     parameters:
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *       - in: query
 *         name: desde
 *         schema: { type: string, format: date-time }
 *       - in: query
 *         name: hasta
 *         schema: { type: string, format: date-time }
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [Borrador, EnRevision, Rechazado, Aprobado]
 *       - in: query
 *         name: unidad
 *         schema: { type: string }
 *       - in: query
 *         name: tecnicoId
 *         schema: { type: integer }
 *       - in: query
 *         name: coordinadorId
 *         schema: { type: integer }
 *     responses:
 *       200: { description: CSV }
 */
router.get('/expedientes/detalle.csv', validate(expDetalleSchema), ctrl.expDetalleCsv);

/**
 * @openapi
 * /reportes/expedientes/serie-diaria:
 *   get:
 *     tags:
 *       - Reportes
 *     summary: Serie diaria de expedientes (opcional por estado)
 *     parameters:
 *       - in: query
 *         name: desde
 *         schema: { type: string, format: date-time }
 *       - in: query
 *         name: hasta
 *         schema: { type: string, format: date-time }
 *       - in: query
 *         name: porEstado
 *         schema: { type: boolean, default: false }
 *     responses:
 *       200: { description: OK }
 */
router.get('/expedientes/serie-diaria', validate(expSerieSchema), ctrl.expSerie);

/**
 * @openapi
 * /reportes/indicios/por-expediente:
 *   get:
 *     tags:
 *       - Reportes
 *     summary: Conteo de indicios por expediente (paginado)
 *     parameters:
 *       - in: query
 *         name: desde
 *         schema: { type: string, format: date-time }
 *       - in: query
 *         name: hasta
 *         schema: { type: string, format: date-time }
 *       - in: query
 *         name: unidad
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1, minimum: 1 }
 *       - in: query
 *         name: pageSize
 *         schema: { type: integer, default: 50, minimum: 1, maximum: 500 }
 *     responses:
 *       200: { description: OK }
 */
router.get('/indicios/por-expediente', validate(indiciosPorExpedienteSchema), ctrl.indiciosPorExpediente);

/**
 * @openapi
 * /reportes/rechazos/motivos:
 *   get:
 *     tags:
 *       - Reportes
 *     summary: Motivos de rechazo más frecuentes
 *     parameters:
 *       - in: query
 *         name: desde
 *         schema: { type: string, format: date-time }
 *       - in: query
 *         name: hasta
 *         schema: { type: string, format: date-time }
 *       - in: query
 *         name: unidad
 *         schema: { type: string }
 *       - in: query
 *         name: coordinadorId
 *         schema: { type: integer }
 *       - in: query
 *         name: top
 *         schema: { type: integer, default: 50 }
 *     responses:
 *       200: { description: OK }
 */
router.get('/rechazos/motivos', validate(rechazosMotivosSchema), ctrl.rechazosMotivos);

export default router;

import Joi from 'joi';

const pag = {
  page: Joi.number().integer().min(1).default(1).empty(''),
  pageSize: Joi.number().integer().min(1).max(500).default(50).empty('')
};
const rango = {
  desde: Joi.date().iso().optional().allow('', null),
  hasta: Joi.date().iso().optional().allow('', null)
};

export const expResumenSchema = {
  query: Joi.object({
    ...rango,
    estado: Joi.string().valid('Borrador','EnRevision','Rechazado','Aprobado').optional().allow('', null),
    unidad: Joi.string().optional().allow('', null),
    tecnicoId: Joi.number().integer().min(1).optional().allow('', null),
    coordinadorId: Joi.number().integer().min(1).optional().allow('', null)
  }).unknown(true)
};

export const expDetalleSchema = {
  query: Joi.object({
    q: Joi.string().optional().allow('', null),
    ...rango,
    estado: Joi.string().valid('Borrador','EnRevision','Rechazado','Aprobado').optional().allow('', null),
    unidad: Joi.string().optional().allow('', null),
    tecnicoId: Joi.number().integer().min(1).optional().allow('', null),
    coordinadorId: Joi.number().integer().min(1).optional().allow('', null),
    ...pag
  }).unknown(true)
};

export const expSerieSchema = {
  query: Joi.object({
    ...rango,
    porEstado: Joi.boolean().truthy('true',1).falsy('false',0).default(false)
  }).unknown(true)
};

export const indiciosPorExpedienteSchema = {
  query: Joi.object({
    ...rango,
    unidad: Joi.string().optional().allow('', null),
    ...pag
  }).unknown(true)
};

export const rechazosMotivosSchema = {
  query: Joi.object({
    ...rango,
    unidad: Joi.string().optional().allow('', null),
    coordinadorId: Joi.number().integer().min(1).optional().allow('', null),
    top: Joi.number().integer().min(1).max(500).optional()
  }).unknown(true)
};

import Joi from 'joi';

const idParam = Joi.object({ id: Joi.number().integer().positive().required() });

export const listSchema = {
  query: Joi.object({
    expedienteId: Joi.number().integer().min(1).allow(null, '').optional(),
    tipo: Joi.string().valid('Aprobado','Rechazado').allow('', null).optional(),
    desde: Joi.date().iso().allow('', null).optional(),
    hasta: Joi.date().iso().allow('', null).optional(),
    decididoPor: Joi.number().integer().min(1).allow(null, '').optional(),
    page: Joi.number().integer().min(1).default(1).empty(''),
    pageSize: Joi.number().integer().min(1).max(200).default(20).empty('')
  }).unknown(true)
};

export const getByIdSchema = { params: idParam };

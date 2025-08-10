import Joi from 'joi';

const idParam = Joi.object({ id: Joi.number().integer().positive().required() });

export const listSchema = {
  query: Joi.object({
    q: Joi.string().allow('', null).empty(''),
    entidad: Joi.string().allow('', null).empty(''),
    entidadId: Joi.number().integer().min(1).allow(null, '').optional(),
    usuarioId: Joi.number().integer().min(1).allow(null, '').optional(),
    desde: Joi.date().iso().allow('', null).optional(),
    hasta: Joi.date().iso().allow('', null).optional(),
    page: Joi.number().integer().min(1).default(1).empty(''),
    pageSize: Joi.number().integer().min(1).max(200).default(20).empty('')
  }).unknown(true)
};

export const getByIdSchema = { params: idParam };

export const addSchema = {
  body: Joi.object({
    accion: Joi.string().min(3).required(),
    entidad: Joi.string().allow(null, '').optional(),
    entidadId: Joi.number().integer().min(1).allow(null).optional(),
    detalle: Joi.alternatives().try(Joi.object(), Joi.string()).allow(null, ''),
    ip: Joi.string().max(64).allow(null, '')
  })
};

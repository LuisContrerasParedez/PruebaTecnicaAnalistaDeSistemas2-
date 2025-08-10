import Joi from 'joi';

const idParam = Joi.object({ id: Joi.number().integer().positive().required() });

export const listSchema = {
  query: Joi.object({
    expedienteId: Joi.number().integer().positive().required(),
    q: Joi.string().allow('', null).empty(''),
    tipo: Joi.string().allow('', null).empty(''),
    desde: Joi.date().iso().optional().empty(''),
    hasta: Joi.date().iso().optional().empty(''),
    page: Joi.number().integer().min(1).default(1).empty(''),
    pageSize: Joi.number().integer().min(1).max(200).default(20).empty('')
  }).unknown(true)
};

export const getByIdSchema = { params: idParam };

export const createSchema = {
  body: Joi.object({
    expedienteId: Joi.number().integer().positive().required(),
    tipo: Joi.string().min(2).required(),
    descripcion: Joi.string().allow(null, ''),
    color: Joi.string().allow(null, ''),
    tamano: Joi.string().allow(null, ''),
    peso: Joi.number().precision(2).allow(null),
    ubicacion: Joi.string().allow(null, ''),
    // si aún no hay auth real, permite mandarlo:
    codigoTecnico: Joi.number().integer().positive().optional(),
    fecha_hora: Joi.date().iso().optional(),
    observaciones: Joi.string().allow(null, '')
  })
};

export const updateSchema = {
  params: idParam,
  body: Joi.object({
    tipo: Joi.string().min(2),
    descripcion: Joi.string().allow(null, ''),
    color: Joi.string().allow(null, ''),
    tamano: Joi.string().allow(null, ''),
    peso: Joi.number().precision(2).allow(null),
    ubicacion: Joi.string().allow(null, ''),
    fecha_hora: Joi.date().iso(),
    observaciones: Joi.string().allow(null, '')
  }).min(1)
};

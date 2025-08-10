import Joi from 'joi';

const idParam = Joi.object({ id: Joi.number().integer().positive().required() });

export const listSchema = {
  query: Joi.object({
    q: Joi.string().allow('', null).empty(''),
    page: Joi.number().integer().min(1).default(1).empty(''),
    pageSize: Joi.number().integer().min(1).max(200).default(20).empty('')
  }).unknown(true)
};

export const getByIdSchema = { params: idParam };

export const createSchema = {
  body: Joi.object({
    nombre: Joi.string().min(3).required(),
    // aceptamos string o JSON (obj/array) y lo serializamos en el service
    permisos: Joi.alternatives().try(Joi.string(), Joi.object(), Joi.array()).optional()
  })
};

export const updateSchema = {
  params: idParam,
  body: Joi.object({
    nombre: Joi.string().min(3),
    permisos: Joi.alternatives().try(Joi.string(), Joi.object(), Joi.array())
  }).min(1)
};

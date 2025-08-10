import Joi from 'joi';

const idParam = Joi.object({ id: Joi.number().integer().positive().required() });
const booleanLoose = Joi.boolean().truthy('true','1',1,true).falsy('false','0',0,false);

export const listSchema = {
  query: Joi.object({
    tipo: Joi.string().allow('', null).empty(''),
    q: Joi.string().allow('', null).empty(''),
    activo: booleanLoose.optional().empty(''),
    page: Joi.number().integer().min(1).default(1).empty(''),
    pageSize: Joi.number().integer().min(1).max(200).default(20).empty('')
  }).unknown(true)
};

export const getByIdSchema = { params: idParam };

export const createSchema = {
  body: Joi.object({
    tipo: Joi.string().min(2).required(),
    valor: Joi.string().min(1).required(),
    activo: booleanLoose.default(true)
  })
};

export const updateSchema = {
  params: idParam,
  body: Joi.object({
    tipo: Joi.string().min(2),
    valor: Joi.string().min(1),
    activo: booleanLoose
  }).min(1)
};

export const setActivoSchema = {
  params: idParam,
  body: Joi.object({ activo: booleanLoose.required() })
};

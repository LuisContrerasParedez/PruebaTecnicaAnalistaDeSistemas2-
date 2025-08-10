import Joi from 'joi';

const idParam = Joi.object({ id: Joi.number().integer().positive().required() });

export const listSchema = {
  query: Joi.object({
    entidad: Joi.string().valid('EXPEDIENTE','INDICIO','USUARIO').insensitive().required(),
    entidadId: Joi.number().integer().positive().required(),
    page: Joi.number().integer().min(1).default(1).empty(''),
    pageSize: Joi.number().integer().min(1).max(200).default(20).empty('')
  }).unknown(true)
};

export const getByIdSchema = { params: idParam };

export const createSchema = {
  body: Joi.object({
    entidad: Joi.string().valid('EXPEDIENTE','INDICIO','USUARIO').insensitive().required(),
    entidadId: Joi.number().integer().positive().required(),
    nombreArchivo: Joi.string().max(300).required(),
    ruta: Joi.string().max(400).required(),
    tipoMime: Joi.string().max(100).required(),
    tamanoBytes: Joi.number().integer().min(0).required(),
    hashOpcional: Joi.string().max(128).allow(null, '')
  })
};

export const updateSchema = {
  params: idParam,
  body: Joi.object({
    nombreArchivo: Joi.string().max(300),
    ruta: Joi.string().max(400),
    tipoMime: Joi.string().max(100),
    tamanoBytes: Joi.number().integer().min(0),
    hashOpcional: Joi.string().max(128).allow(null, '')
  }).min(1)
};

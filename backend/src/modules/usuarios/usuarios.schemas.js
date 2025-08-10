// src/modules/usuarios/usuarios.schemas.js
import Joi from 'joi';

const idParam = Joi.object({ id: Joi.number().integer().positive().required() });

const booleanLoose = Joi.boolean()
  .truthy('true', '1', 1, true)
  .falsy('false', '0', 0, false);

export const listSchema = {
  query: Joi.object({
    q: Joi.string().allow('', null).empty(''),            
    activo: booleanLoose.optional().empty(''),                 
    page: Joi.number().integer().min(1).default(1).empty(''),  
    pageSize: Joi.number().integer().min(1).max(200).default(20).empty('') 
  }).unknown(true) // ignora params extra
};

export const getByIdSchema = { params: idParam };

export const createSchema = {
  body: Joi.object({
    nombre: Joi.string().min(3).required(),
    correo: Joi.string().email().required(),
    codigoRol: Joi.number().integer().positive().required(),
    unidad: Joi.string().allow(null, ''),
    activo: booleanLoose.default(true),
    password: Joi.string().min(6).optional()
  })
};

export const updateSchema = {
  params: idParam,
  body: Joi.object({
    nombre: Joi.string().min(3),
    unidad: Joi.string().allow(null, ''),
    activo: booleanLoose,
    codigoRol: Joi.number().integer().positive()
  }).min(1)
};

export const setPasswordSchema = {
  params: idParam,
  body: Joi.object({ password: Joi.string().min(6).required() })
};

export const setActivoSchema = {
  params: idParam,
  body: Joi.object({ activo: booleanLoose.required() })
};

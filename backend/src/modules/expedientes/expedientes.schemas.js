import Joi from 'joi';

const idParam = Joi.object({ id: Joi.number().integer().positive().required() });
const booleanLoose = Joi.boolean().truthy('true','1',1,true).falsy('false','0',0,false);

export const listSchema = {
  query: Joi.object({
    q: Joi.string().allow('', null).empty(''),
    estado: Joi.string().valid('Borrador','EnRevision','Rechazado','Aprobado').optional().empty(''),
    desde: Joi.date().iso().optional().empty(''),
    hasta: Joi.date().iso().optional().empty(''),
    tecnicoId: Joi.number().integer().positive().optional().empty(''),
    coordinadorId: Joi.number().integer().positive().optional().empty(''),
    page: Joi.number().integer().min(1).default(1).empty(''),
    pageSize: Joi.number().integer().min(1).max(200).default(20).empty('')
  }).unknown(true)
};

export const getByIdSchema = { params: idParam };

export const createSchema = {
  body: Joi.object({
    fiscalia: Joi.string().allow(null, ''),
    unidad: Joi.string().allow(null, ''),
    descripcion: Joi.string().allow(null, ''),
    ubicacion_texto: Joi.string().allow(null, ''),
    municipio: Joi.string().allow(null, ''),
    departamento: Joi.string().allow(null, ''),
    codigoTecnico: Joi.number().integer().positive().optional() // si no hay auth, puedes enviarlo
  })
};

export const updateSchema = {
  params: idParam,
  body: Joi.object({
    fiscalia: Joi.string().allow(null, ''),
    unidad: Joi.string().allow(null, ''),
    descripcion: Joi.string().allow(null, ''),
    ubicacion_texto: Joi.string().allow(null, ''),
    municipio: Joi.string().allow(null, ''),
    departamento: Joi.string().allow(null, '')
  }).min(1)
};

export const sendToReviewSchema = {
  params: idParam,
  body: Joi.object({
    coordinadorId: Joi.number().integer().positive().required()
  })
};

export const approveSchema = { params: idParam }; 

export const rejectSchema = {
  params: idParam,
  body: Joi.object({
    justificacion: Joi.string().min(10).required()
  })
};

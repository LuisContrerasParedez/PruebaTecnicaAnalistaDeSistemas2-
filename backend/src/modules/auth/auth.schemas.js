const Joi = require('joi');

exports.loginSchema = {
  body: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
  })
};

exports.refreshSchema = {
  body: Joi.object({
    refreshToken: Joi.string().required()
  })
};

exports.logoutSchema = {
  body: Joi.object({
    refreshToken: Joi.string().required()
  })
};

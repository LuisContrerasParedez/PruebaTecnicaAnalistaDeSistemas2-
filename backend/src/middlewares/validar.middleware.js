// src/middlewares/validar.middleware.js
export const validarBody = (schema) => (req, res, next) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ errors: parsed.error.flatten() });
  }
  req.body = parsed.data;
  next();
};

export const validarParams = (schema) => (req, res, next) => {
  const parsed = schema.safeParse(req.params);
  if (!parsed.success) {
    return res.status(400).json({ errors: parsed.error.flatten() });
  }
  req.params = parsed.data;
  next();
};

// src/middlewares/validate.js
export const validate = (schema) => (req, res, next) => {
  const opts = { convert: true, abortEarly: false, stripUnknown: true };

  try {
    const validated = {};
    if (schema?.params) {
      const { error, value } = schema.params.validate(req.params, opts);
      if (error) return res.status(400).json({ message: error.message, details: error.details });
      validated.params = value;
    }
    if (schema?.query) {
      const { error, value } = schema.query.validate(req.query, opts);
      if (error) return res.status(400).json({ message: error.message, details: error.details });
      validated.query = value;
    }
    if (schema?.body) {
      const { error, value } = schema.body.validate(req.body, opts);
      if (error) return res.status(400).json({ message: error.message, details: error.details });
      validated.body = value;
    }

    // NO reasignes req.query/params/body (solo lectura en Express 5)
    req.validated = { ...(req.validated || {}), ...validated };
    next();
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

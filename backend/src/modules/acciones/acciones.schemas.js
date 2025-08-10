import { z } from 'zod';

// /acciones/:id
export const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

// POST /acciones
export const crearAccionSchema = z.object({
  nombre: z.string().min(1).max(100),
  descripcion: z.string().max(255).nullish(),
});

// PUT /acciones/:id
export const actualizarAccionSchema = crearAccionSchema
  .partial()
  .refine((d) => Object.keys(d).length > 0, {
    message: 'Debes enviar al menos un campo para actualizar',
  });

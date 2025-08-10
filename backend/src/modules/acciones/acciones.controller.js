import { accionesService } from './acciones.service.js';

const mapAccion = (a) => ({
  id: a.Id,
  nombre: a.Nombre,
  descripcion: a.Descripcion,
  fechaCreacion: a.FechaCreacion,
});

export const listar = async (_req, res, next) => {
  try {
    const rows = await accionesService.listar();
    res.json(rows.map(mapAccion));
  } catch (err) { next(err); }
};

export const obtener = async (req, res, next) => {
  try {
    const row = await accionesService.obtener(req.params.id);
    if (!row) return res.status(404).json({ message: 'No encontrado' });
    res.json(mapAccion(row));
  } catch (err) { next(err); }
};

export const crear = async (req, res, next) => {
  try {
    const row = await accionesService.crear(req.body);
    res.status(201).json(mapAccion(row));
  } catch (err) { next(err); }
};

export const actualizar = async (req, res, next) => {
  try {
    const row = await accionesService.actualizar(req.params.id, req.body);
    res.json(mapAccion(row));
  } catch (err) {
    if (err?.code === 'P2025') return res.status(404).json({ message: 'No encontrado' });
    next(err);
  }
};

export const eliminar = async (req, res, next) => {
  try {
    await accionesService.eliminar(req.params.id);
    res.status(204).end();
  } catch (err) {
    if (err?.code === 'P2025') return res.status(404).json({ message: 'No encontrado' });
    next(err);
  }
};

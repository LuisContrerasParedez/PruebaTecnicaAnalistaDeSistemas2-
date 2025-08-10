// backend/src/controllers/acciones.controller.js
import { prisma } from '../lib/prisma.js';

export const listar = async (_req, res, next) => {
  try {
    const rows = await prisma.accion.findMany({ orderBy: { Id: 'desc' } });
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

export const obtener = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const row = await prisma.accion.findUnique({ where: { Id: id } });
    if (!row) return res.status(404).json({ message: 'No encontrado' });
    res.json(row);
  } catch (err) {
    next(err);
  }
};

export const crear = async (req, res, next) => {
  try {
    const { nombre, descripcion } = req.body;
    const item = await prisma.accion.create({
      data: {
        Nombre: nombre,
        Descripcion: descripcion ?? null,
      },
      select: { Id: true, Nombre: true, Descripcion: true },
    });
    res.status(201).json({
      id: item.Id,
      nombre: item.Nombre,
      descripcion: item.Descripcion,
    });
  } catch (err) {
    next(err);
  }
};

export const actualizar = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { nombre, descripcion } = req.body;

    const item = await prisma.accion.update({
      where: { Id: id },
      data: {
        Nombre: nombre,
        Descripcion: descripcion ?? null,
      },
      select: { Id: true, Nombre: true, Descripcion: true },
    });

    res.json({
      id: item.Id,
      nombre: item.Nombre,
      descripcion: item.Descripcion,
    });
  } catch (err) {
    // Si no existe, Prisma lanza P2025
    if (err.code === 'P2025') {
      return res.status(404).json({ message: 'No encontrado' });
    }
    next(err);
  }
};

export const eliminar = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    await prisma.accion.delete({ where: { Id: id } });
    res.status(204).end();
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ message: 'No encontrado' });
    }
    next(err);
  }
};

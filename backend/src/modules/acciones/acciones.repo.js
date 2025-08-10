import { prisma } from '../../lib/prisma.js';

export const accionesRepo = {
  list() {
    return prisma.accion.findMany({ orderBy: { Id: 'desc' } });
  },

  getById(id) {
    return prisma.accion.findUnique({ where: { Id: id } });
  },

  create({ nombre, descripcion }) {
    return prisma.accion.create({
      data: { Nombre: nombre, Descripcion: descripcion ?? null },
    });
  },

  update(id, { nombre, descripcion }) {
    return prisma.accion.update({
      where: { Id: id },
      data: { Nombre: nombre, Descripcion: descripcion ?? null },
    });
  },

  remove(id) {
    return prisma.accion.delete({ where: { Id: id } });
  },
};

// src/modules/acciones/acciones.service.js
import { accionesRepo } from './acciones.repo.js';

export const accionesService = {
  listar() {
    return accionesRepo.list();
  },

  async obtener(id) {
    return accionesRepo.getById(id);
  },

  crear(payload) {
    return accionesRepo.create(payload);
  },

  async actualizar(id, payload) {
    return accionesRepo.update(id, payload);
  },

  eliminar(id) {
    return accionesRepo.remove(id);
  },
};

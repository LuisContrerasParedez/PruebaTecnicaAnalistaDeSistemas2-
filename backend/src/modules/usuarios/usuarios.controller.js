// src/modules/usuarios/usuarios.controller.js
import * as svc from './usuarios.service.js';

export async function list(req, res) {
  const query = req.validated?.query || req.query || {};
  const data = await svc.list(query);
  res.json(data);
}

export async function getById(req, res) {
  const id = +(req.validated?.params?.id ?? req.params.id);
  const row = await svc.getById(id);
  if (!row) return res.status(404).json({ message: 'No encontrado' });
  res.json(row);
}

export async function create(req, res) {
  const body = req.validated?.body || req.body;
  const out = await svc.create(req.user, body, req);
  res.status(201).json(out);
}

export async function update(req, res) {
  const id   = +(req.validated?.params?.id ?? req.params.id);
  const body = req.validated?.body || req.body;
  const out = await svc.update(req.user, id, body, req);
  res.json(out);
}

export async function setPassword(req, res) {
  const id   = +(req.validated?.params?.id ?? req.params.id);
  const { password } = req.validated?.body || req.body;
  const out = await svc.setPassword(req.user, id, password, req);
  res.json(out);
}

export async function setActivo(req, res) {
  const id   = +(req.validated?.params?.id ?? req.params.id);
  const { activo } = req.validated?.body || req.body;
  const out = await svc.setActivo(req.user, id, activo, req);
  res.json(out);
}

export async function remove(req, res) {
  const id = +(req.validated?.params?.id ?? req.params.id);
  const out = await svc.remove(req.user, id, req);
  res.json(out);
}

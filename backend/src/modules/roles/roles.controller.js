import * as svc from './roles.service.js';

export async function list(req, res) {
  const query = req.validated?.query || req.query || {};
  const out = await svc.list(query);
  res.json(out);
}

export async function getById(req, res) {
  const id = +(req.validated?.params?.id ?? req.params.id);
  const row = await svc.getById(id);
  if (!row) return res.status(404).json({ message: 'No encontrado' });
  res.json(row);
}

export async function create(req, res) {
  const body = req.validated?.body || req.body;
  const out = await svc.create(body);
  res.status(201).json(out);
}

export async function update(req, res) {
  const id   = +(req.validated?.params?.id ?? req.params.id);
  const body = req.validated?.body || req.body;
  const out = await svc.update(id, body);
  res.json(out);
}

export async function remove(req, res) {
  const id = +(req.validated?.params?.id ?? req.params.id);
  const out = await svc.remove(id);
  res.json(out);
}

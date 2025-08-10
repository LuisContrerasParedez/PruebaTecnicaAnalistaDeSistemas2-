import * as svc from './bitacora.service.js';

export async function list(req, res) {
  const query = req.validated?.query || req.query || {};
  res.json(await svc.list(query));
}

export async function getById(req, res) {
  const id = +(req.validated?.params?.id ?? req.params.id);
  const row = await svc.getById(id);
  if (!row) return res.status(404).json({ message: 'No encontrado' });
  res.json(row);
}

export async function add(req, res) {
  const body = req.validated?.body || req.body;
  const ip = req.ip || req.headers['x-forwarded-for'] || null;
  const out = await svc.add(req.user, body, ip);
  res.status(201).json(out);
}

import * as svc from './decisiones.service.js';

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

import * as svc from './expedientes.service.js';


function getActor(req) {
  const sub =
    req.user?.sub ??
    req.user?.id ??
    req.headers['x-user-id']; 

  return sub ? { sub: String(sub) } : null;
}


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

export async function create(req, res) {
  const body = req.validated?.body || req.body;
  const out = await svc.create(req.user, body);
  res.status(201).json(out);
}

export async function update(req, res) {
  const id   = +(req.validated?.params?.id ?? req.params.id);
  const body = req.validated?.body || req.body;
  res.json(await svc.update(req.user, id, body));
}

export async function sendToReview(req, res) {
  const id   = +(req.validated?.params?.id ?? req.params.id);
  const body = req.validated?.body || req.body;
  res.json(await svc.sendToReview(req.user, id, body));
}

export async function approve(req, res) {
  const id = +(req.validated?.params?.id ?? req.params.id);
  const actor = getActor(req);
  console.log('[approve] actor:', actor, 'x-user-id:', req.headers['x-user-id']); 
  res.json(await svc.approve(actor, id));
}

export async function reject(req, res, next) {
  try {
    const id   = +(req.validated?.params?.id ?? req.params.id);
    const body = req.validated?.body || req.body;
    const actor = getActor(req);
    if (!actor) return res.status(401).json({ message: 'Falta actor (x-user-id o token)' });

    console.log('[reject] actor:', actor, 'x-user-id:', req.headers['x-user-id']);
    const out = await svc.reject(actor, id, body);   // <-- te faltaba esto
    res.json(out ?? { ok: true });                   // <-- y esto
  } catch (e) { next(e); }
}
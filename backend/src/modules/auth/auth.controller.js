import * as svc from './auth.service.js';

export async function login(req, res) {
  try { res.json(await svc.login(req.body, req)); }
  catch (e) { res.status(401).json({ message: e.message || 'Credenciales inválidas' }); }
}

export async function refresh(req, res) {
  try { res.json(await svc.refresh(req.body.refreshToken, req)); }
  catch (e) { res.status(401).json({ message: e.message || 'Refresh inválido' }); }
}

export async function logout(req, res) {
  try { await svc.logout(req.body.refreshToken); res.json({ ok: true }); }
  catch (e) { res.status(500).json({ message: e.message }); }
}

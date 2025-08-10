// src/modules/auth/auth.service.js  (ESM)
import bcrypt from 'bcryptjs';
import { prisma } from '../../lib/prisma.js';
import { signAccess, signRefresh, verifyRefresh } from '../../lib/jwt.js';

const parseTtl = (ttl) => {
  const n = parseInt(ttl, 10);
  if (ttl.endsWith('ms')) return n;
  if (ttl.endsWith('s'))  return n * 1000;
  if (ttl.endsWith('m'))  return n * 60 * 1000;
  if (ttl.endsWith('h'))  return n * 60 * 60 * 1000;
  if (ttl.endsWith('d'))  return n * 24 * 60 * 60 * 1000;
  return n;
};

const payloadFromRow = (u) => ({ sub: u.CodigoUsuario, email: u.correo, role: u.rol_nombre });

export const login = async (body, req) => {
  const { email, password } = body;

  // Usuario por correo (SP)
  const rows = await prisma.$queryRaw`
    EXEC dbo.spAuth_GetUserByEmail @correo = ${email}
  `;
  const u = rows?.[0];
  if (!u || !u.activo) throw new Error('Credenciales inválidas');
  if (!u.password_hash) throw new Error('Usuario sin contraseña configurada');

  const ok = await bcrypt.compare(password, u.password_hash);
  if (!ok) throw new Error('Credenciales inválidas');

  const payload = payloadFromRow(u);
  const accessToken  = signAccess(payload);
  const refreshToken = signRefresh(payload);

  // Guardar sesión (hash del refresh) via SP
  const refreshHash = await bcrypt.hash(refreshToken, 10);
  const expAt = new Date(Date.now() + parseTtl(process.env.JWT_REFRESH_TTL || '30d'));

  await prisma.$queryRaw`
    EXEC dbo.spAuth_CreateSession
      @UsuarioId = ${u.CodigoUsuario},
      @RefreshHash = ${refreshHash},
      @ExpiresAt = ${expAt},
      @Ip = ${req.ip || null},
      @UserAgent = ${req.headers['user-agent'] || null}
  `;

  return {
    user: { id: u.CodigoUsuario, nombre: u.nombre, correo: u.correo, rol: u.rol_nombre },
    accessToken,
    refreshToken
  };
};

export const refresh = async (refreshToken, req) => {
  if (!refreshToken) throw new Error('Falta refreshToken');

  let decoded;
  try { decoded = verifyRefresh(refreshToken); }
  catch { throw new Error('Refresh inválido'); }

  const sessions = await prisma.$queryRaw`
    EXEC dbo.spAuth_ListActiveSessionsByUser @UsuarioId = ${decoded.sub}
  `;

  const match = await findMatchingSession(sessions, refreshToken);
  if (!match) throw new Error('Refresh no encontrado/expirado/revocado');

  const payload = { sub: match.UsuarioId, email: match.correo, role: match.rol_nombre };
  const accessToken = signAccess(payload);

  // Rotación de refresh
  const newRefresh = signRefresh(payload);
  const newHash    = await bcrypt.hash(newRefresh, 10);
  const expAt      = new Date(Date.now() + parseTtl(process.env.JWT_REFRESH_TTL || '30d'));

  await prisma.$queryRaw`EXEC dbo.spAuth_RevokeSession @RefreshHash = ${match.refresh_token_hash}`;
  await prisma.$queryRaw`
    EXEC dbo.spAuth_CreateSession
      @UsuarioId = ${match.UsuarioId},
      @RefreshHash = ${newHash},
      @ExpiresAt = ${expAt},
      @Ip = ${req?.ip || null},
      @UserAgent = ${req?.headers['user-agent'] || null}
  `;

  return { accessToken, refreshToken: newRefresh };
};

export const logout = async (refreshToken) => {
  if (!refreshToken) return;
  let decoded;
  try { decoded = verifyRefresh(refreshToken); } catch { return; }

  const sessions = await prisma.$queryRaw`
    EXEC dbo.spAuth_ListActiveSessionsByUser @UsuarioId = ${decoded.sub}
  `;
  const match = await findMatchingSession(sessions, refreshToken);
  if (match) {
    await prisma.$queryRaw`EXEC dbo.spAuth_RevokeSession @RefreshHash = ${match.refresh_token_hash}`;
  }
};

async function findMatchingSession(rows, tokenPlain) {
  for (const r of rows) {
    if (r.refresh_token_hash && await bcrypt.compare(tokenPlain, r.refresh_token_hash)) return r;
  }
  return null;
}

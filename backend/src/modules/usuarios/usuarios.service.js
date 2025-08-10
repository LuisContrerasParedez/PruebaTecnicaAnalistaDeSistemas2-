import bcrypt from 'bcryptjs';
import { prisma } from '../../lib/prisma.js';

export async function list(q = {}) {
  const page = q.page ? parseInt(q.page, 10) : 1;
  const pageSize = q.pageSize ? parseInt(q.pageSize, 10) : 20;
  const activo = (q.activo === undefined || q.activo === null)
    ? null
    : (q.activo === true || q.activo === 'true' || q.activo === 1 || q.activo === '1' ? 1 : 0);
  const rol = q.rol ? parseInt(q.rol, 10) : null;

  const rows = await prisma.$queryRaw`
    EXEC dbo.spUsuario_List
      @q = ${q.q ?? null},
      @rol = ${rol},
      @activo = ${activo},
      @page = ${page},
      @pageSize = ${pageSize}
  `;

  const total = rows?.[0]?.total_count ?? 0;
  return { data: rows, page, pageSize, total };
}

export async function getById(id) {
  const rows = await prisma.$queryRaw`EXEC dbo.spUsuario_GetById @id = ${id}`;
  return rows?.[0] || null;
}

export async function create(actor, body, req) {
  const passHash = body.password ? await bcrypt.hash(body.password, 10) : null;

  const rows = await prisma.$queryRaw`
    EXEC dbo.spUsuario_Create
      @nombre = ${body.nombre},
      @correo = ${body.correo},
      @codigoRol = ${body.codigoRol},
      @unidad = ${body.unidad ?? null},
      @activo = ${body.activo ?? 1},
      @passwordHash = ${passHash}
  `;

  return rows?.[0];
}

export async function update(actor, id, body, req) {
  const rows = await prisma.$queryRaw`
    EXEC dbo.spUsuario_Update
      @id = ${id},
      @nombre = ${body.nombre ?? null},
      @correo = ${body.correo ?? null},
      @codigoRol = ${body.codigoRol ?? null},
      @unidad = ${body.unidad ?? null},
      @activo = ${body.activo ?? null}
  `;
  return rows?.[0];
}

export async function setActivo(actor, id, activo, req) {
  const bit = (activo === true || activo === 'true' || activo === 1 || activo === '1') ? 1 : 0;
  const rows = await prisma.$queryRaw`
    EXEC dbo.spUsuario_SetActivo
      @id = ${id},
      @activo = ${bit}
  `;
  return rows?.[0];
}

export async function setPassword(actor, id, plainPassword, req) {
  const hash = await bcrypt.hash(plainPassword, 10);
  const rows = await prisma.$queryRaw`
    EXEC dbo.spUsuario_SetPassword
      @id = ${id},
      @passwordHash = ${hash}
  `;
  // este SP devuelve { id }
  return rows?.[0];
}

/** “Eliminar” = inactivar */
export async function remove(actor, id, req) {
  return setActivo(actor, id, false, req);
}

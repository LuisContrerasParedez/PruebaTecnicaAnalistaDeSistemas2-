import { prisma } from '../../lib/prisma.js';

const serializePerms = (p) => {
  if (p === undefined || p === null) return null;
  return typeof p === 'string' ? p : JSON.stringify(p);
};

export async function list(q = {}) {
  const page = q.page ? parseInt(q.page, 10) : 1;
  const pageSize = q.pageSize ? parseInt(q.pageSize, 10) : 20;

  const rows = await prisma.$queryRaw`
    EXEC dbo.spRol_List
      @q = ${q.q ?? null},
      @page = ${page},
      @pageSize = ${pageSize}
  `;
  const total = rows?.[0]?.total_count ?? 0;
  return { data: rows, page, pageSize, total };
}

export async function getById(id) {
  const rows = await prisma.$queryRaw`EXEC dbo.spRol_GetById @id = ${id}`;
  return rows?.[0] || null;
}

export async function create(body) {
  const permisos = serializePerms(body.permisos);
  const rows = await prisma.$queryRaw`
    EXEC dbo.spRol_Create
      @nombre = ${body.nombre},
      @permisos = ${permisos}
  `;
  return rows?.[0];
}

export async function update(id, body) {
  const permisos = body.permisos === undefined ? null : serializePerms(body.permisos);
  const rows = await prisma.$queryRaw`
    EXEC dbo.spRol_Update
      @id = ${id},
      @nombre = ${body.nombre ?? null},
      @permisos = ${permisos}
  `;
  return rows?.[0];
}

export async function remove(id) {
  const rows = await prisma.$queryRaw`EXEC dbo.spRol_Delete @id = ${id}`;
  return rows?.[0] ?? { affected: 0 };
}

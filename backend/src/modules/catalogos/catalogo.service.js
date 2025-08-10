import { prisma } from '../../lib/prisma.js';

export async function list(q = {}) {
  const page = q.page ? parseInt(q.page, 10) : 1;
  const pageSize = q.pageSize ? parseInt(q.pageSize, 10) : 20;
  const activo = (q.activo === undefined || q.activo === null)
    ? null
    : (q.activo === true || q.activo === 'true' || q.activo === 1 || q.activo === '1' ? 1 : 0);

  const rows = await prisma.$queryRaw`
    EXEC dbo.spCatalogo_List
      @tipo = ${q.tipo ?? null},
      @q = ${q.q ?? null},
      @activo = ${activo},
      @page = ${page},
      @pageSize = ${pageSize}
  `;

  const total = rows?.[0]?.total_count ?? 0;
  return { data: rows, page, pageSize, total };
}

export async function getById(id) {
  const rows = await prisma.$queryRaw`EXEC dbo.spCatalogo_GetById @id = ${id}`;
  return rows?.[0] || null;
}

export async function create(body) {
  const rows = await prisma.$queryRaw`
    EXEC dbo.spCatalogo_Create
      @tipo = ${body.tipo},
      @valor = ${body.valor},
      @activo = ${body.activo ?? 1}
  `;
  return rows?.[0];
}

export async function update(id, body) {
  const rows = await prisma.$queryRaw`
    EXEC dbo.spCatalogo_Update
      @id = ${id},
      @tipo = ${body.tipo ?? null},
      @valor = ${body.valor ?? null},
      @activo = ${body.activo ?? null}
  `;
  return rows?.[0];
}

export async function setActivo(id, activo) {
  const bit = (activo === true || activo === 'true' || activo === 1 || activo === '1') ? 1 : 0;
  const rows = await prisma.$queryRaw`
    EXEC dbo.spCatalogo_SetActivo
      @id = ${id},
      @activo = ${bit}
  `;
  return rows?.[0];
}

export async function remove(id) {
  const rows = await prisma.$queryRaw`EXEC dbo.spCatalogo_Delete @id = ${id}`;
  return rows?.[0] ?? { affected: 0 };
}

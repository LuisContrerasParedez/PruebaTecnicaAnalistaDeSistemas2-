import { prisma } from '../../lib/prisma.js';

export async function list(q = {}) {
  const page = q.page ? parseInt(q.page, 10) : 1;
  const pageSize = q.pageSize ? parseInt(q.pageSize, 10) : 20;

  const rows = await prisma.$queryRaw`
    EXEC dbo.spExpediente_List
      @q = ${q.q ?? null},
      @estado = ${q.estado ?? null},
      @desde = ${q.desde ?? null},
      @hasta = ${q.hasta ?? null},
      @tecnicoId = ${q.tecnicoId ?? null},
      @coordinadorId = ${q.coordinadorId ?? null},
      @page = ${page},
      @pageSize = ${pageSize}
  `;
  const total = rows?.[0]?.total_count ?? 0;
  return { data: rows, page, pageSize, total };
}

export async function getById(id) {
  // sp devuelve 2 result sets; prisma concatena filas. Tomamos la primera del expediente.
  const rows = await prisma.$queryRaw`EXEC dbo.spExpediente_GetById @id = ${id}`;
  return rows?.[0] || null;
}

export async function create(actor, body) {
  const codigoTecnico = body.codigoTecnico ?? actor?.sub ?? null;
  if (!codigoTecnico) throw new Error('codigoTecnico requerido');

  const rows = await prisma.$queryRaw`
    EXEC dbo.spExpediente_Create
      @fiscalia = ${body.fiscalia ?? null},
      @unidad = ${body.unidad ?? null},
      @descripcion = ${body.descripcion ?? null},
      @ubicacion_texto = ${body.ubicacion_texto ?? null},
      @municipio = ${body.municipio ?? null},
      @departamento = ${body.departamento ?? null},
      @codigoTecnico = ${codigoTecnico}
  `;
  return rows?.[0];
}

export async function update(actor, id, body) {
  const rows = await prisma.$queryRaw`
    EXEC dbo.spExpediente_Update
      @id = ${id},
      @fiscalia = ${body.fiscalia ?? null},
      @unidad = ${body.unidad ?? null},
      @descripcion = ${body.descripcion ?? null},
      @ubicacion_texto = ${body.ubicacion_texto ?? null},
      @municipio = ${body.municipio ?? null},
      @departamento = ${body.departamento ?? null}
  `;
  return rows?.[0];
}

export async function sendToReview(actor, id, body) {
  const rows = await prisma.$queryRaw`
    EXEC dbo.spExpediente_SendToReview
      @id = ${id},
      @coordinadorId = ${body.coordinadorId}
  `;
  return rows?.[0];
}

export async function approve(actor, id) {
  const decididoPor = actor?.sub ?? null;
  if (!decididoPor) throw new Error('decididoPor requerido (usuario autenticado)');
  const rows = await prisma.$queryRaw`
    EXEC dbo.spExpediente_Approve
      @id = ${id},
      @decididoPor = ${decididoPor}
  `;
  return rows?.[0];
}

export async function reject(actor, id, body) {
  const decididoPor = actor?.sub ?? null;
  if (!decididoPor) throw new Error('decididoPor requerido (usuario autenticado)');
  const rows = await prisma.$queryRaw`
    EXEC dbo.spExpediente_Reject
      @id = ${id},
      @justificacion = ${body.justificacion},
      @decididoPor = ${decididoPor}
  `;
  return rows?.[0];
}

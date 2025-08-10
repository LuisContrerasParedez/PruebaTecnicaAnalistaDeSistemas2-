import { prisma } from '../../lib/prisma.js';

export async function list(q = {}) {
  const page = q.page ? parseInt(q.page, 10) : 1;
  const pageSize = q.pageSize ? parseInt(q.pageSize, 10) : 20;

  const rows = await prisma.$queryRaw`
    DECLARE @pDesdeStr NVARCHAR(30) = ${q.desde ?? null};
    DECLARE @pHastaStr NVARCHAR(30) = ${q.hasta ?? null};
    DECLARE @pUsrStr   NVARCHAR(30) = ${q.usuarioId ?? null};
    DECLARE @pEntIdStr NVARCHAR(30) = ${q.entidadId ?? null};

    DECLARE @pDesde DATETIME2 = CASE WHEN @pDesdeStr IS NOT NULL AND ISDATE(@pDesdeStr)=1
                                     THEN CONVERT(DATETIME2, @pDesdeStr) ELSE NULL END;
    DECLARE @pHasta DATETIME2 = CASE WHEN @pHastaStr IS NOT NULL AND ISDATE(@pHastaStr)=1
                                     THEN CONVERT(DATETIME2, @pHastaStr) ELSE NULL END;
    DECLARE @pUsr INT = CASE WHEN @pUsrStr IS NOT NULL AND ISNUMERIC(@pUsrStr)=1
                             THEN CAST(@pUsrStr AS INT) ELSE NULL END;
    DECLARE @pEntId INT = CASE WHEN @pEntIdStr IS NOT NULL AND ISNUMERIC(@pEntIdStr)=1
                               THEN CAST(@pEntIdStr AS INT) ELSE NULL END;

    EXEC dbo.spBitacora_List
      @q         = ${q.q ?? null},
      @entidad   = ${q.entidad ?? null},
      @entidadId = @pEntId,
      @usuarioId = @pUsr,
      @desde     = @pDesde,
      @hasta     = @pHasta,
      @page      = ${page},
      @pageSize  = ${pageSize};
  `;

  const total = rows?.[0]?.total_count ?? 0;
  return { data: rows, page, pageSize, total };
}

export async function getById(id) {
  const rows = await prisma.$queryRaw`EXEC dbo.spBitacora_GetById @id = ${id}`;
  return rows?.[0] || null;
}

export async function add(actor, body, ipFromReq) {
  const usuarioId = actor?.sub ?? body.usuarioId ?? null;
  if (!usuarioId) throw new Error('usuarioId requerido (usuario autenticado)');

  const detalleJson =
    body?.detalle && typeof body.detalle === 'object'
      ? JSON.stringify(body.detalle)
      : (body?.detalle ?? null);

  const rows = await prisma.$queryRaw`
    EXEC dbo.spBitacora_Add
      @usuarioId  = ${usuarioId},
      @accion     = ${body.accion},
      @entidad    = ${body.entidad ?? null},
      @entidadId  = ${body.entidadId ?? null},
      @detalleJson= ${detalleJson},
      @ip         = ${body.ip ?? ipFromReq ?? null};
  `;
  return rows?.[0];
}

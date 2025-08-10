import { prisma } from '../../lib/prisma.js';

export async function list(q = {}) {
  const page = q.page ? parseInt(q.page, 10) : 1;
  const pageSize = q.pageSize ? parseInt(q.pageSize, 10) : 20;

  const rows = await prisma.$queryRaw`
    DECLARE @pDesdeStr NVARCHAR(30) = ${q.desde ?? null};
    DECLARE @pHastaStr NVARCHAR(30) = ${q.hasta ?? null};
    DECLARE @pDecStr   NVARCHAR(30) = ${q.decididoPor ?? null};

    DECLARE @pDesde DATETIME2 = CASE WHEN @pDesdeStr IS NOT NULL AND ISDATE(@pDesdeStr)=1
                                     THEN CONVERT(DATETIME2,@pDesdeStr) ELSE NULL END;
    DECLARE @pHasta DATETIME2 = CASE WHEN @pHastaStr IS NOT NULL AND ISDATE(@pHastaStr)=1
                                     THEN CONVERT(DATETIME2,@pHastaStr) ELSE NULL END;
    DECLARE @pDec INT = CASE WHEN @pDecStr IS NOT NULL AND ISNUMERIC(@pDecStr)=1
                              THEN CAST(@pDecStr AS INT) ELSE NULL END;

    EXEC dbo.spDecision_List
      @expedienteId = ${q.expedienteId ?? null},
      @tipo         = ${q.tipo ?? null},
      @desde        = @pDesde,
      @hasta        = @pHasta,
      @decididoPor  = @pDec,
      @page         = ${page},
      @pageSize     = ${pageSize};
  `;

  const total = rows?.[0]?.total_count ?? 0;
  return { data: rows, page, pageSize, total };
}

export async function getById(id) {
  const rows = await prisma.$queryRaw`EXEC dbo.spDecision_GetById @id = ${id}`;
  return rows?.[0] || null;
}

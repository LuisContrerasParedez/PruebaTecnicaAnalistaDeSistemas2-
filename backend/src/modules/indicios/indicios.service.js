import { prisma } from '../../lib/prisma.js';

export async function list(q = {}) {
  const page = q.page ? parseInt(q.page, 10) : 1;
  const pageSize = q.pageSize ? parseInt(q.pageSize, 10) : 20;

  const rows = await prisma.$queryRaw`
    DECLARE @pDesdeStr NVARCHAR(30) = ${q.desde ?? null};
    DECLARE @pHastaStr NVARCHAR(30) = ${q.hasta ?? null};

    DECLARE @pDesde DATETIME2 = CASE WHEN @pDesdeStr IS NOT NULL AND ISDATE(@pDesdeStr) = 1
                                     THEN CONVERT(DATETIME2, @pDesdeStr) ELSE NULL END;
    DECLARE @pHasta DATETIME2 = CASE WHEN @pHastaStr IS NOT NULL AND ISDATE(@pHastaStr) = 1
                                     THEN CONVERT(DATETIME2, @pHastaStr) ELSE NULL END;

    EXEC dbo.spIndicio_List
      @expedienteId = ${q.expedienteId},
      @q            = ${q.q ?? null},
      @tipo         = ${q.tipo ?? null},
      @desde        = @pDesde,
      @hasta        = @pHasta,
      @page         = ${page},
      @pageSize     = ${pageSize};
  `;

  const total = rows?.[0]?.total_count ?? 0;
  return { data: rows, page, pageSize, total };
}

export async function getById(id) {
  const rows = await prisma.$queryRaw`EXEC dbo.spIndicio_GetById @id = ${id}`;
  return rows?.[0] || null;
}

export async function create(actor, body) {
  const tecnicoId = body.codigoTecnico ?? actor?.sub ?? null;
  if (!tecnicoId) throw new Error('codigoTecnico requerido (usuario autenticado)');

  const rows = await prisma.$queryRaw`
    DECLARE @pFechaStr NVARCHAR(30) = ${body.fecha_hora ?? null};
    DECLARE @pPesoStr  NVARCHAR(50) = ${body.peso ?? null};

    DECLARE @pFecha DATETIME2 = CASE WHEN @pFechaStr IS NOT NULL AND ISDATE(@pFechaStr) = 1
                                     THEN CONVERT(DATETIME2, @pFechaStr) ELSE NULL END;
    DECLARE @pPeso DECIMAL(10,2) = CASE WHEN @pPesoStr IS NOT NULL AND ISNUMERIC(@pPesoStr) = 1
                                        THEN CAST(@pPesoStr AS DECIMAL(10,2)) ELSE NULL END;

    EXEC dbo.spIndicio_Create
      @expedienteId = ${body.expedienteId},
      @tipo         = ${body.tipo},
      @descripcion  = ${body.descripcion ?? null},
      @color        = ${body.color ?? null},
      @tamano       = ${body.tamano ?? null},
      @peso         = @pPeso,
      @ubicacion    = ${body.ubicacion ?? null},
      @codigoTecnico= ${tecnicoId},
      @fecha_hora   = @pFecha,
      @observaciones= ${body.observaciones ?? null};
  `;

  return rows?.[0];
}

export async function update(actor, id, body) {
  const rows = await prisma.$queryRaw`
    DECLARE @pFechaStr NVARCHAR(30) = ${body.fecha_hora ?? null};
    DECLARE @pPesoStr  NVARCHAR(50) = ${body.peso ?? null};

    DECLARE @pFecha DATETIME2 = CASE WHEN @pFechaStr IS NOT NULL AND ISDATE(@pFechaStr) = 1
                                     THEN CONVERT(DATETIME2, @pFechaStr) ELSE NULL END;
    DECLARE @pPeso DECIMAL(10,2) = CASE WHEN @pPesoStr IS NOT NULL AND ISNUMERIC(@pPesoStr) = 1
                                        THEN CAST(@pPesoStr AS DECIMAL(10,2)) ELSE NULL END;

    EXEC dbo.spIndicio_Update
      @id           = ${id},
      @tipo         = ${body.tipo ?? null},
      @descripcion  = ${body.descripcion ?? null},
      @color        = ${body.color ?? null},
      @tamano       = ${body.tamano ?? null},
      @peso         = @pPeso,
      @ubicacion    = ${body.ubicacion ?? null},
      @fecha_hora   = @pFecha,
      @observaciones= ${body.observaciones ?? null};
  `;

  return rows?.[0];
}

export async function remove(id) {
  const rows = await prisma.$queryRaw`EXEC dbo.spIndicio_Delete @id = ${id}`;
  return rows?.[0] ?? { affected: 0 };
}

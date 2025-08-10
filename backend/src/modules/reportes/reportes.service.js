import { prisma } from '../../lib/prisma.js';

function nv(v) { return v ?? null; }

export async function expResumen(q = {}) {
  const rows = await prisma.$queryRaw`
    DECLARE @d NVARCHAR(30) = ${nv(q.desde)};
    DECLARE @h NVARCHAR(30) = ${nv(q.hasta)};
    DECLARE @tecStr NVARCHAR(30) = ${nv(q.tecnicoId)};
    DECLARE @cooStr NVARCHAR(30) = ${nv(q.coordinadorId)};

    DECLARE @desde DATETIME2 = CASE WHEN @d IS NOT NULL AND ISDATE(@d)=1 THEN CONVERT(DATETIME2,@d) ELSE NULL END;
    DECLARE @hasta DATETIME2 = CASE WHEN @h IS NOT NULL AND ISDATE(@h)=1 THEN CONVERT(DATETIME2,@h) ELSE NULL END;
    DECLARE @tec INT = CASE WHEN @tecStr IS NOT NULL AND ISNUMERIC(@tecStr)=1 THEN CAST(@tecStr AS INT) ELSE NULL END;
    DECLARE @coo INT = CASE WHEN @cooStr IS NOT NULL AND ISNUMERIC(@cooStr)=1 THEN CAST(@cooStr AS INT) ELSE NULL END;

    EXEC dbo.spReporte_ExpedientesResumen
      @desde = @desde,
      @hasta = @hasta,
      @estado = ${nv(q.estado)},
      @unidad = ${nv(q.unidad)},
      @tecnicoId = @tec,
      @coordinadorId = @coo;
  `;
  return rows;
}

export async function expDetalle(q = {}) {
  const page = q.page ? parseInt(q.page,10) : 1;
  const pageSize = q.pageSize ? parseInt(q.pageSize,10) : 50;

  const rows = await prisma.$queryRaw`
    DECLARE @d NVARCHAR(30) = ${nv(q.desde)};
    DECLARE @h NVARCHAR(30) = ${nv(q.hasta)};
    DECLARE @tecStr NVARCHAR(30) = ${nv(q.tecnicoId)};
    DECLARE @cooStr NVARCHAR(30) = ${nv(q.coordinadorId)};

    DECLARE @desde DATETIME2 = CASE WHEN @d IS NOT NULL AND ISDATE(@d)=1 THEN CONVERT(DATETIME2,@d) ELSE NULL END;
    DECLARE @hasta DATETIME2 = CASE WHEN @h IS NOT NULL AND ISDATE(@h)=1 THEN CONVERT(DATETIME2,@h) ELSE NULL END;
    DECLARE @tec INT = CASE WHEN @tecStr IS NOT NULL AND ISNUMERIC(@tecStr)=1 THEN CAST(@tecStr AS INT) ELSE NULL END;
    DECLARE @coo INT = CASE WHEN @cooStr IS NOT NULL AND ISNUMERIC(@cooStr)=1 THEN CAST(@cooStr AS INT) ELSE NULL END;

    EXEC dbo.spReporte_ExpedientesDetalle
      @q = ${nv(q.q)},
      @desde = @desde,
      @hasta = @hasta,
      @estado = ${nv(q.estado)},
      @unidad = ${nv(q.unidad)},
      @tecnicoId = @tec,
      @coordinadorId = @coo,
      @page = ${page},
      @pageSize = ${pageSize};
  `;
  const total = rows?.[0]?.total_count ?? 0;
  return { data: rows, page, pageSize, total };
}

export async function expSerie(q = {}) {
  const rows = await prisma.$queryRaw`
    DECLARE @d NVARCHAR(30) = ${nv(q.desde)};
    DECLARE @h NVARCHAR(30) = ${nv(q.hasta)};
    DECLARE @desde DATETIME2 = CASE WHEN @d IS NOT NULL AND ISDATE(@d)=1 THEN CONVERT(DATETIME2,@d) ELSE NULL END;
    DECLARE @hasta DATETIME2 = CASE WHEN @h IS NOT NULL AND ISDATE(@h)=1 THEN CONVERT(DATETIME2,@h) ELSE NULL END;

    EXEC dbo.spReporte_ExpedientesSerieDiaria
      @desde = @desde,
      @hasta = @hasta,
      @porEstado = ${q.porEstado ? 1 : 0};
  `;
  return rows;
}

export async function indiciosPorExpediente(q = {}) {
  const page = q.page ? parseInt(q.page,10) : 1;
  const pageSize = q.pageSize ? parseInt(q.pageSize,10) : 50;

  const rows = await prisma.$queryRaw`
    DECLARE @d NVARCHAR(30) = ${nv(q.desde)};
    DECLARE @h NVARCHAR(30) = ${nv(q.hasta)};
    DECLARE @desde DATETIME2 = CASE WHEN @d IS NOT NULL AND ISDATE(@d)=1 THEN CONVERT(DATETIME2,@d) ELSE NULL END;
    DECLARE @hasta DATETIME2 = CASE WHEN @h IS NOT NULL AND ISDATE(@h)=1 THEN CONVERT(DATETIME2,@h) ELSE NULL END;

    EXEC dbo.spReporte_IndiciosPorExpediente
      @desde = @desde,
      @hasta = @hasta,
      @unidad = ${nv(q.unidad)},
      @page = ${page},
      @pageSize = ${pageSize};
  `;
  const total = rows?.[0]?.total_count ?? 0;
  return { data: rows, page, pageSize, total };
}

export async function rechazosMotivos(q = {}) {
  const rows = await prisma.$queryRaw`
    DECLARE @d NVARCHAR(30) = ${nv(q.desde)};
    DECLARE @h NVARCHAR(30) = ${nv(q.hasta)};
    DECLARE @decStr NVARCHAR(30) = ${nv(q.coordinadorId)};

    DECLARE @desde DATETIME2 = CASE WHEN @d IS NOT NULL AND ISDATE(@d)=1 THEN CONVERT(DATETIME2,@d) ELSE NULL END;
    DECLARE @hasta DATETIME2 = CASE WHEN @h IS NOT NULL AND ISDATE(@h)=1 THEN CONVERT(DATETIME2,@h) ELSE NULL END;
    DECLARE @dec INT = CASE WHEN @decStr IS NOT NULL AND ISNUMERIC(@decStr)=1 THEN CAST(@decStr AS INT) ELSE NULL END;

    EXEC dbo.spReporte_RechazosMotivos
      @desde = @desde,
      @hasta = @hasta,
      @unidad = ${nv(q.unidad)},
      @coordinadorId = @dec,
      @top = ${q.top ?? null};
  `;
  return rows;
}

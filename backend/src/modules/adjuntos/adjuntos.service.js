import { prisma } from '../../lib/prisma.js';

export async function list(q = {}) {
  const page = q.page ? parseInt(q.page, 10) : 1;
  const pageSize = q.pageSize ? parseInt(q.pageSize, 10) : 20;
  const entidad = (q.entidad || '').toUpperCase();

  const rows = await prisma.$queryRaw`
    EXEC dbo.spAdjunto_List
      @entidad   = ${entidad},
      @entidadId = ${q.entidadId},
      @page      = ${page},
      @pageSize  = ${pageSize};
  `;
  const total = rows?.[0]?.total_count ?? 0;
  return { data: rows, page, pageSize, total };
}

export async function getById(id) {
  const rows = await prisma.$queryRaw`EXEC dbo.spAdjunto_GetById @id = ${id}`;
  return rows?.[0] || null;
}

export async function create(actor, body) {
  const subidoPor = actor?.sub ?? actor?.id ?? 2; // Ajusta según tu auth

  const entidad = (body.entidad || '').toUpperCase();

  const rows = await prisma.$queryRaw`
    DECLARE @tamStr NVARCHAR(40) = ${body.tamanoBytes ?? null};
    DECLARE @tam INT = CASE WHEN @tamStr IS NOT NULL AND ISNUMERIC(@tamStr)=1
                             THEN CAST(@tamStr AS INT) ELSE NULL END;

    EXEC dbo.spAdjunto_Create
      @entidad        = ${entidad},
      @entidadId      = ${body.entidadId},
      @nombre_archivo = ${body.nombreArchivo},
      @ruta           = ${body.ruta},
      @tipo_mime      = ${body.tipoMime},
      @tamano_bytes   = @tam,
      @hash_opcional  = ${body.hashOpcional ?? null},
      @subido_por     = ${subidoPor};
  `;
  return rows?.[0];
}

export async function update(id, body) {
  const rows = await prisma.$queryRaw`
    DECLARE @tamStr NVARCHAR(40) = ${body.tamanoBytes ?? null};
    DECLARE @tam INT = CASE WHEN @tamStr IS NOT NULL AND ISNUMERIC(@tamStr)=1
                             THEN CAST(@tamStr AS INT) ELSE NULL END;

    EXEC dbo.spAdjunto_Update
      @id             = ${id},
      @nombre_archivo = ${body.nombreArchivo ?? null},
      @ruta           = ${body.ruta ?? null},
      @tipo_mime      = ${body.tipoMime ?? null},
      @tamano_bytes   = @tam,
      @hash_opcional  = ${body.hashOpcional ?? null};
  `;
  return rows?.[0];
}

export async function remove(id) {
  const rows = await prisma.$queryRaw`EXEC dbo.spAdjunto_Delete @id = ${id}`;
  return rows?.[0] ?? { affected: 0 };
}

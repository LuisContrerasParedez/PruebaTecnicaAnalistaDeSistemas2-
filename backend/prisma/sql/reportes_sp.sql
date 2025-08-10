/* =========
   EXPEDIENTES: RESUMEN POR ESTADO
   ========= */
EXEC(N'
CREATE OR ALTER PROCEDURE dbo.spReporte_ExpedientesResumen
  @desde DATETIME2 = NULL,
  @hasta DATETIME2 = NULL,
  @estado NVARCHAR(20) = NULL,
  @unidad NVARCHAR(200) = NULL,
  @tecnicoId INT = NULL,
  @coordinadorId INT = NULL
AS
BEGIN
  SET NOCOUNT ON;

  SELECT
    e.estado,
    COUNT(*) AS total
  FROM dbo.EXPEDIENTE e
  WHERE (@desde IS NULL OR e.creado_en >= @desde)
    AND (@hasta  IS NULL OR e.creado_en < DATEADD(DAY,1,@hasta))
    AND (@estado IS NULL OR e.estado = @estado)
    AND (@unidad IS NULL OR e.unidad = @unidad)
    AND (@tecnicoId IS NULL OR e.CodigoTecnico = @tecnicoId)
    AND (@coordinadorId IS NULL OR e.CodigoCoordinador = @coordinadorId)
  GROUP BY e.estado
  ORDER BY CASE e.estado
            WHEN N''Borrador''  THEN 1
            WHEN N''EnRevision'' THEN 2
            WHEN N''Rechazado'' THEN 3
            WHEN N''Aprobado''  THEN 4
            ELSE 9 END;
END
');

/* =========
   EXPEDIENTES: DETALLE (para listados/export)
   ========= */
EXEC(N'
CREATE OR ALTER PROCEDURE dbo.spReporte_ExpedientesDetalle
  @q NVARCHAR(200) = NULL,
  @desde DATETIME2 = NULL,
  @hasta DATETIME2 = NULL,
  @estado NVARCHAR(20) = NULL,
  @unidad NVARCHAR(200) = NULL,
  @tecnicoId INT = NULL,
  @coordinadorId INT = NULL,
  @page INT = 1,
  @pageSize INT = 20
AS
BEGIN
  SET NOCOUNT ON;
  IF @page < 1 SET @page = 1;
  IF @pageSize < 1 SET @pageSize = 20;

  ;WITH X AS (
    SELECT
      e.CodigoExpediente,
      e.no_expediente,
      e.fiscalia,
      e.unidad,
      e.estado,
      e.descripcion,
      e.creado_en,
      e.actualizado_en,
      tec.nombre AS tecnico_nombre,
      coo.nombre AS coordinador_nombre,
      (SELECT COUNT(*) FROM dbo.INDICIO i WHERE i.CodigoExpediente=e.CodigoExpediente) AS indicios_count
    FROM dbo.EXPEDIENTE e
    JOIN dbo.USUARIO tec ON tec.CodigoUsuario = e.CodigoTecnico
    LEFT JOIN dbo.USUARIO coo ON coo.CodigoUsuario = e.CodigoCoordinador
    WHERE (@q IS NULL OR e.no_expediente LIKE ''%''+@q+''%'' OR e.descripcion LIKE ''%''+@q+''%'' OR e.unidad LIKE ''%''+@q+''%'')
      AND (@desde IS NULL OR e.creado_en >= @desde)
      AND (@hasta  IS NULL OR e.creado_en < DATEADD(DAY,1,@hasta))
      AND (@estado IS NULL OR e.estado = @estado)
      AND (@unidad IS NULL OR e.unidad = @unidad)
      AND (@tecnicoId IS NULL OR e.CodigoTecnico = @tecnicoId)
      AND (@coordinadorId IS NULL OR e.CodigoCoordinador = @coordinadorId)
  )
  SELECT *,
         COUNT(*) OVER() AS total_count
  FROM X
  ORDER BY CodigoExpediente DESC
  OFFSET (@page-1)*@pageSize ROWS FETCH NEXT @pageSize ROWS ONLY;
END
');

/* =========
   EXPEDIENTES: SERIE DIARIA (con opción por estado)
   ========= */
EXEC(N'
CREATE OR ALTER PROCEDURE dbo.spReporte_ExpedientesSerieDiaria
  @desde DATETIME2 = NULL,
  @hasta DATETIME2 = NULL,
  @porEstado BIT = 0
AS
BEGIN
  SET NOCOUNT ON;

  IF @porEstado = 1
  BEGIN
    SELECT
      CAST(e.creado_en AS DATE) AS fecha,
      e.estado,
      COUNT(*) AS total
    FROM dbo.EXPEDIENTE e
    WHERE (@desde IS NULL OR e.creado_en >= @desde)
      AND (@hasta  IS NULL OR e.creado_en < DATEADD(DAY,1,@hasta))
    GROUP BY CAST(e.creado_en AS DATE), e.estado
    ORDER BY fecha, estado;
  END
  ELSE
  BEGIN
    SELECT
      CAST(e.creado_en AS DATE) AS fecha,
      COUNT(*) AS total
    FROM dbo.EXPEDIENTE e
    WHERE (@desde IS NULL OR e.creado_en >= @desde)
      AND (@hasta  IS NULL OR e.creado_en < DATEADD(DAY,1,@hasta))
    GROUP BY CAST(e.creado_en AS DATE)
    ORDER BY fecha;
  END
END
');

/* =========
   INDICIOS: CONTEO POR EXPEDIENTE
   ========= */
EXEC(N'
CREATE OR ALTER PROCEDURE dbo.spReporte_IndiciosPorExpediente
  @desde DATETIME2 = NULL,
  @hasta DATETIME2 = NULL,
  @unidad NVARCHAR(200) = NULL,
  @page INT = 1,
  @pageSize INT = 20
AS
BEGIN
  SET NOCOUNT ON;
  IF @page < 1 SET @page = 1;
  IF @pageSize < 1 SET @pageSize = 20;

  ;WITH X AS (
    SELECT
      e.CodigoExpediente,
      e.no_expediente,
      e.unidad,
      COUNT(i.CodigoIndicio) AS indicios_count,
      MIN(i.fecha_hora) AS primer_indicio,
      MAX(i.fecha_hora) AS ultimo_indicio
    FROM dbo.EXPEDIENTE e
    LEFT JOIN dbo.INDICIO i ON i.CodigoExpediente = e.CodigoExpediente
    WHERE (@desde IS NULL OR i.fecha_hora >= @desde)
      AND (@hasta  IS NULL OR i.fecha_hora < DATEADD(DAY,1,@hasta))
      AND (@unidad IS NULL OR e.unidad = @unidad)
    GROUP BY e.CodigoExpediente, e.no_expediente, e.unidad
  )
  SELECT *, COUNT(*) OVER() AS total_count
  FROM X
  ORDER BY indicios_count DESC, CodigoExpediente DESC
  OFFSET (@page-1)*@pageSize ROWS FETCH NEXT @pageSize ROWS ONLY;
END
');

/* =========
   RECHAZOS: MOTIVOS MÁS FRECUENTES
   ========= */
EXEC(N'
CREATE OR ALTER PROCEDURE dbo.spReporte_RechazosMotivos
  @desde DATETIME2 = NULL,
  @hasta DATETIME2 = NULL,
  @unidad NVARCHAR(200) = NULL,
  @coordinadorId INT = NULL,
  @top INT = NULL
AS
BEGIN
  SET NOCOUNT ON;

  SELECT TOP (ISNULL(@top, 50))
    COALESCE(NULLIF(LTRIM(RTRIM(d.justificacion)), N''''), N''(Sin justificación)'') AS motivo,
    COUNT(*) AS total
  FROM dbo.DECISION d
  JOIN dbo.EXPEDIENTE e ON e.CodigoExpediente = d.CodigoExpediente
  WHERE d.tipo = N''Rechazado''
    AND (@desde IS NULL OR d.decidido_en >= @desde)
    AND (@hasta  IS NULL OR d.decidido_en < DATEADD(DAY,1,@hasta))
    AND (@unidad IS NULL OR e.unidad = @unidad)
    AND (@coordinadorId IS NULL OR d.decidido_por = @coordinadorId)
  GROUP BY COALESCE(NULLIF(LTRIM(RTRIM(d.justificacion)), N''''), N''(Sin justificación)'')
  ORDER BY total DESC;
END
');

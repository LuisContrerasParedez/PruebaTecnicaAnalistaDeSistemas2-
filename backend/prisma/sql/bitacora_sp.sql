IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name='IX_BIT_CodUsuario' AND object_id=OBJECT_ID('dbo.BITACORA'))
  CREATE INDEX IX_BIT_CodUsuario ON dbo.BITACORA(CodigoUsuario);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name='IX_BIT_Entidad' AND object_id=OBJECT_ID('dbo.BITACORA'))
  CREATE INDEX IX_BIT_Entidad ON dbo.BITACORA(entidad, entidad_id);

/* GET BY ID */
EXEC(N'
CREATE OR ALTER PROCEDURE dbo.spBitacora_GetById
  @id INT
AS
BEGIN
  SET NOCOUNT ON;
  SELECT TOP 1 b.CodigoBitacora, b.CodigoUsuario, u.nombre AS usuario_nombre,
         b.accion, b.entidad, b.entidad_id, b.detalle_json, b.ip, b.creado_en
  FROM dbo.BITACORA b
  JOIN dbo.USUARIO u ON u.CodigoUsuario = b.CodigoUsuario
  WHERE b.CodigoBitacora = @id;
END
');

/* LIST */
EXEC(N'
CREATE OR ALTER PROCEDURE dbo.spBitacora_List
  @q NVARCHAR(200) = NULL,
  @entidad NVARCHAR(50) = NULL,
  @entidadId INT = NULL,
  @usuarioId INT = NULL,
  @desde DATETIME2 = NULL,
  @hasta DATETIME2 = NULL,
  @page INT = 1,
  @pageSize INT = 20
AS
BEGIN
  SET NOCOUNT ON;
  IF @page < 1 SET @page = 1;
  IF @pageSize < 1 SET @pageSize = 20;

  SELECT b.CodigoBitacora, b.CodigoUsuario, u.nombre AS usuario_nombre,
         b.accion, b.entidad, b.entidad_id, b.detalle_json, b.ip, b.creado_en,
         COUNT(*) OVER() AS total_count
  FROM dbo.BITACORA b
  JOIN dbo.USUARIO u ON u.CodigoUsuario = b.CodigoUsuario
  WHERE (@q IS NULL OR b.accion LIKE ''%''+@q+''%'' OR b.entidad LIKE ''%''+@q+''%'' OR b.detalle_json LIKE ''%''+@q+''%'')
    AND (@entidad IS NULL OR b.entidad = @entidad)
    AND (@entidadId IS NULL OR b.entidad_id = @entidadId)
    AND (@usuarioId IS NULL OR b.CodigoUsuario = @usuarioId)
    AND (@desde IS NULL OR b.creado_en >= @desde)
    AND (@hasta IS NULL OR b.creado_en < DATEADD(DAY,1,@hasta))
  ORDER BY b.CodigoBitacora DESC
  OFFSET (@page-1)*@pageSize ROWS FETCH NEXT @pageSize ROWS ONLY;
END
');

/* ADD (crear registro) */
EXEC(N'
CREATE OR ALTER PROCEDURE dbo.spBitacora_Add
  @usuarioId INT,
  @accion NVARCHAR(200),
  @entidad NVARCHAR(50) = NULL,
  @entidadId INT = NULL,
  @detalleJson NVARCHAR(MAX) = NULL,
  @ip NVARCHAR(64) = NULL
AS
BEGIN
  SET NOCOUNT ON;

  INSERT INTO dbo.BITACORA(CodigoUsuario, accion, entidad, entidad_id, detalle_json, ip, creado_en)
  VALUES(@usuarioId, @accion, @entidad, @entidadId, @detalleJson, @ip, SYSUTCDATETIME());

  DECLARE @id INT = SCOPE_IDENTITY();
  EXEC dbo.spBitacora_GetById @id=@id;
END
');
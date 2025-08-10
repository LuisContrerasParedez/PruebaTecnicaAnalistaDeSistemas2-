IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name='IX_IND_CodExp' AND object_id=OBJECT_ID('dbo.INDICIO'))
  CREATE INDEX IX_IND_CodExp ON dbo.INDICIO(CodigoExpediente);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name='UQ_IND_Exp_Cod' AND object_id=OBJECT_ID('dbo.INDICIO'))
  CREATE UNIQUE INDEX UQ_IND_Exp_Cod ON dbo.INDICIO(CodigoExpediente, codigo_indicio);

/* ====== LIST ====== */
EXEC(N'
CREATE OR ALTER PROCEDURE dbo.spIndicio_List
  @expedienteId INT,
  @q NVARCHAR(200) = NULL,
  @tipo NVARCHAR(100) = NULL,
  @desde DATETIME2 = NULL,
  @hasta DATETIME2 = NULL,
  @page INT = 1,
  @pageSize INT = 20
AS
BEGIN
  SET NOCOUNT ON;
  IF @page < 1 SET @page = 1;
  IF @pageSize < 1 SET @pageSize = 20;

  SELECT i.CodigoIndicio, i.CodigoExpediente, i.codigo_indicio, i.tipo, i.descripcion, i.color,
         i.tamano, i.peso, i.ubicacion, i.CodigoTecnico, i.fecha_hora, i.observaciones,
         i.creado_en, i.actualizado_en, u.nombre AS tecnico_nombre,
         COUNT(*) OVER() AS total_count
  FROM dbo.INDICIO i
  JOIN dbo.USUARIO u ON u.CodigoUsuario = i.CodigoTecnico
  WHERE i.CodigoExpediente = @expedienteId
    AND (@q IS NULL OR i.codigo_indicio LIKE ''%''+@q+''%'' OR i.descripcion LIKE ''%''+@q+''%'' OR i.tipo LIKE ''%''+@q+''%'')
    AND (@tipo IS NULL OR i.tipo = @tipo)
    AND (@desde IS NULL OR i.fecha_hora >= @desde)
    AND (@hasta IS NULL OR i.fecha_hora < DATEADD(DAY, 1, @hasta))
  ORDER BY i.CodigoIndicio DESC
  OFFSET (@page-1)*@pageSize ROWS FETCH NEXT @pageSize ROWS ONLY;
END
');

/* ====== GET BY ID ====== */
EXEC(N'
CREATE OR ALTER PROCEDURE dbo.spIndicio_GetById
  @id INT
AS
BEGIN
  SET NOCOUNT ON;
  SELECT TOP 1 i.*, u.nombre AS tecnico_nombre
  FROM dbo.INDICIO i
  JOIN dbo.USUARIO u ON u.CodigoUsuario = i.CodigoTecnico
  WHERE i.CodigoIndicio = @id;
END
');

/* ====== CREATE ====== */
EXEC(N'
CREATE OR ALTER PROCEDURE dbo.spIndicio_Create
  @expedienteId INT,
  @tipo NVARCHAR(100),
  @descripcion NVARCHAR(MAX) = NULL,
  @color NVARCHAR(50) = NULL,
  @tamano NVARCHAR(50) = NULL,
  @peso DECIMAL(10,2) = NULL,
  @ubicacion NVARCHAR(100) = NULL,
  @codigoTecnico INT,
  @fecha_hora DATETIME2 = NULL,
  @observaciones NVARCHAR(MAX) = NULL
AS
BEGIN
  SET NOCOUNT ON;

  /* reglas de edición según estado del expediente */
  DECLARE @estado NVARCHAR(20), @no NVARCHAR(50);
  SELECT @estado = estado, @no = no_expediente
  FROM dbo.EXPEDIENTE WHERE CodigoExpediente=@expedienteId;

  IF @estado IS NULL THROW 50050, ''Expediente no existe'', 1;
  IF @estado IN (N''EnRevision'', N''Aprobado'')
    THROW 50051, ''No se pueden agregar indicios en EnRevision/Aprobado'', 1;

  /* generar código: EXP-<no_expediente>-I### */
  DECLARE @seq INT = (SELECT COUNT(*) FROM dbo.INDICIO WHERE CodigoExpediente=@expedienteId) + 1;
  DECLARE @codigo NVARCHAR(150) = CONCAT(N''EXP-'', @no, N''-I'', RIGHT(REPLICATE(''0'',3) + CAST(@seq AS NVARCHAR(10)), 3));

  INSERT INTO dbo.INDICIO(
    CodigoExpediente, codigo_indicio, tipo, descripcion, color, tamano, peso, ubicacion,
    CodigoTecnico, fecha_hora, observaciones, creado_en, actualizado_en
  )
  VALUES(
    @expedienteId, @codigo, @tipo, @descripcion, @color, @tamano, @peso, @ubicacion,
    @codigoTecnico, COALESCE(@fecha_hora, SYSUTCDATETIME()), @observaciones, SYSUTCDATETIME(), SYSUTCDATETIME()
  );

  DECLARE @id INT = SCOPE_IDENTITY();
  EXEC dbo.spIndicio_GetById @id=@id;
END
');

/* ====== UPDATE (solo si exp. no está en EnRevision/Aprobado) ====== */
EXEC(N'
CREATE OR ALTER PROCEDURE dbo.spIndicio_Update
  @id INT,
  @tipo NVARCHAR(100) = NULL,
  @descripcion NVARCHAR(MAX) = NULL,
  @color NVARCHAR(50) = NULL,
  @tamano NVARCHAR(50) = NULL,
  @peso DECIMAL(10,2) = NULL,
  @ubicacion NVARCHAR(100) = NULL,
  @fecha_hora DATETIME2 = NULL,
  @observaciones NVARCHAR(MAX) = NULL
AS
BEGIN
  SET NOCOUNT ON;

  DECLARE @expId INT, @estado NVARCHAR(20);
  SELECT @expId = CodigoExpediente FROM dbo.INDICIO WHERE CodigoIndicio=@id;
  IF @expId IS NULL THROW 50052, ''Indicio no existe'', 1;

  SELECT @estado = estado FROM dbo.EXPEDIENTE WHERE CodigoExpediente=@expId;
  IF @estado IN (N''EnRevision'', N''Aprobado'')
    THROW 50053, ''No editable en EnRevision/Aprobado'', 1;

  UPDATE dbo.INDICIO
     SET tipo          = COALESCE(@tipo, tipo),
         descripcion   = COALESCE(@descripcion, descripcion),
         color         = COALESCE(@color, color),
         tamano        = COALESCE(@tamano, tamano),
         peso          = COALESCE(@peso, peso),
         ubicacion     = COALESCE(@ubicacion, ubicacion),
         fecha_hora    = COALESCE(@fecha_hora, fecha_hora),
         observaciones = COALESCE(@observaciones, observaciones),
         actualizado_en = SYSUTCDATETIME()
   WHERE CodigoIndicio=@id;

  EXEC dbo.spIndicio_GetById @id=@id;
END
');

/* ====== DELETE (solo si exp. no está en EnRevision/Aprobado) ====== */
EXEC(N'
CREATE OR ALTER PROCEDURE dbo.spIndicio_Delete
  @id INT
AS
BEGIN
  SET NOCOUNT ON;

  DECLARE @expId INT, @estado NVARCHAR(20);
  SELECT @expId = CodigoExpediente FROM dbo.INDICIO WHERE CodigoIndicio=@id;
  IF @expId IS NULL THROW 50054, ''Indicio no existe'', 1;

  SELECT @estado = estado FROM dbo.EXPEDIENTE WHERE CodigoExpediente=@expId;
  IF @estado IN (N''EnRevision'', N''Aprobado'')
    THROW 50055, ''No se puede eliminar en EnRevision/Aprobado'', 1;

  DELETE FROM dbo.INDICIO WHERE CodigoIndicio=@id;
  SELECT @@ROWCOUNT AS affected;
END
');


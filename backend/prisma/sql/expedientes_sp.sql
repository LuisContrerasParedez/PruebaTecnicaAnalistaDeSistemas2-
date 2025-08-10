IF COL_LENGTH('dbo.EXPEDIENTE','no_expediente') IS NULL
  ALTER TABLE dbo.EXPEDIENTE ADD no_expediente NVARCHAR(50) NULL; -- por si falta

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name='UQ_EXP_no_expediente' AND object_id=OBJECT_ID('dbo.EXPEDIENTE'))
  CREATE UNIQUE INDEX UQ_EXP_no_expediente ON dbo.EXPEDIENTE(no_expediente);

IF OBJECT_ID('dbo.DICRI_NUM_EXP','U') IS NULL
BEGIN
  CREATE TABLE dbo.DICRI_NUM_EXP(
    anio INT NOT NULL PRIMARY KEY,
    secuencia INT NOT NULL
  );
END
/* helper para siguiente número por año */
EXEC(N'
CREATE OR ALTER PROCEDURE dbo.spNumerador_NextExp
  @anio INT,
  @siguiente INT OUTPUT
AS
BEGIN
  SET NOCOUNT ON;
  DECLARE @cur INT;

  BEGIN TRAN;
  IF EXISTS(SELECT 1 FROM dbo.DICRI_NUM_EXP WITH(UPDLOCK, HOLDLOCK) WHERE anio=@anio)
  BEGIN
    UPDATE dbo.DICRI_NUM_EXP SET secuencia = secuencia + 1 WHERE anio=@anio;
    SELECT @cur = secuencia FROM dbo.DICRI_NUM_EXP WHERE anio=@anio;
  END
  ELSE
  BEGIN
    INSERT INTO dbo.DICRI_NUM_EXP(anio, secuencia) VALUES(@anio, 1);
    SET @cur = 1;
  END
  COMMIT;

  SET @siguiente = @cur;
END
');

/* ====== EXPEDIENTES ====== */

/* LIST */
EXEC(N'
CREATE OR ALTER PROCEDURE dbo.spExpediente_List
  @q NVARCHAR(200) = NULL,
  @estado NVARCHAR(20) = NULL,  -- Borrador|EnRevision|Rechazado|Aprobado
  @desde DATE = NULL,
  @hasta DATE = NULL,
  @tecnicoId INT = NULL,
  @coordinadorId INT = NULL,
  @page INT = 1,
  @pageSize INT = 20
AS
BEGIN
  SET NOCOUNT ON;
  IF @page < 1 SET @page = 1;
  IF @pageSize < 1 SET @pageSize = 20;

  SELECT e.CodigoExpediente, e.no_expediente, e.fiscalia, e.unidad, e.descripcion, e.ubicacion_texto,
         e.municipio, e.departamento, e.estado, e.CodigoTecnico, e.CodigoCoordinador,
         e.creado_en, e.actualizado_en,
         u1.nombre AS tecnico_nombre, u2.nombre AS coordinador_nombre,
         COUNT(*) OVER() AS total_count
  FROM dbo.EXPEDIENTE e
  JOIN dbo.USUARIO u1 ON u1.CodigoUsuario = e.CodigoTecnico
  LEFT JOIN dbo.USUARIO u2 ON u2.CodigoUsuario = e.CodigoCoordinador
  WHERE (@q IS NULL OR e.no_expediente LIKE ''%''+@q+''%'' OR e.descripcion LIKE ''%''+@q+''%'' OR e.unidad LIKE ''%''+@q+''%'')
    AND (@estado IS NULL OR e.estado = @estado)
    AND (@desde IS NULL OR CONVERT(date, e.creado_en) >= @desde)
    AND (@hasta IS NULL OR CONVERT(date, e.creado_en) <= @hasta)
    AND (@tecnicoId IS NULL OR e.CodigoTecnico = @tecnicoId)
    AND (@coordinadorId IS NULL OR e.CodigoCoordinador = @coordinadorId)
  ORDER BY e.CodigoExpediente DESC
  OFFSET (@page-1)*@pageSize ROWS FETCH NEXT @pageSize ROWS ONLY;
END
');

/* GET BY ID (incluye último estado/decisión si hay) */
EXEC(N'
CREATE OR ALTER PROCEDURE dbo.spExpediente_GetById
  @id INT
AS
BEGIN
  SET NOCOUNT ON;
  SELECT TOP 1 e.CodigoExpediente, e.no_expediente, e.fiscalia, e.unidad, e.descripcion, e.ubicacion_texto,
         e.municipio, e.departamento, e.estado, e.CodigoTecnico, e.CodigoCoordinador,
         e.creado_en, e.actualizado_en,
         u1.nombre AS tecnico_nombre, u2.nombre AS coordinador_nombre
  FROM dbo.EXPEDIENTE e
  JOIN dbo.USUARIO u1 ON u1.CodigoUsuario = e.CodigoTecnico
  LEFT JOIN dbo.USUARIO u2 ON u2.CodigoUsuario = e.CodigoCoordinador
  WHERE e.CodigoExpediente = @id;

  SELECT TOP 1 d.CodigoDecision, d.tipo, d.justificacion, d.decidido_por, d.decidido_en
  FROM dbo.DECISION d
  WHERE d.CodigoExpediente = @id
  ORDER BY d.CodigoDecision DESC;
END
');

/* CREATE (genera no_expediente: DICRI-<YYYY>-NNNNNN) */
EXEC(N'
CREATE OR ALTER PROCEDURE dbo.spExpediente_Create
  @fiscalia NVARCHAR(200) = NULL,
  @unidad NVARCHAR(200) = NULL,
  @descripcion NVARCHAR(MAX) = NULL,
  @ubicacion_texto NVARCHAR(200) = NULL,
  @municipio NVARCHAR(100) = NULL,
  @departamento NVARCHAR(100) = NULL,
  @codigoTecnico INT
AS
BEGIN
  SET NOCOUNT ON;

  DECLARE @anio INT = YEAR(SYSUTCDATETIME());
  DECLARE @seq INT;
  EXEC dbo.spNumerador_NextExp @anio=@anio, @siguiente=@seq OUTPUT;

  DECLARE @num NVARCHAR(50) = CONCAT(N''DICRI-'', @anio, N''-'', RIGHT(REPLICATE(''0'',6) + CAST(@seq AS NVARCHAR(10)), 6));

  INSERT INTO dbo.EXPEDIENTE(no_expediente, fiscalia, unidad, descripcion, ubicacion_texto, municipio, departamento,
                             estado, CodigoTecnico, CodigoCoordinador, creado_en, actualizado_en)
  VALUES (@num, @fiscalia, @unidad, @descripcion, @ubicacion_texto, @municipio, @departamento,
          N''Borrador'', @codigoTecnico, NULL, SYSUTCDATETIME(), SYSUTCDATETIME());

  DECLARE @id INT = SCOPE_IDENTITY();
  EXEC dbo.spExpediente_GetById @id=@id;
END
');

/* UPDATE: solo permitido en Borrador o Rechazado */
EXEC(N'
CREATE OR ALTER PROCEDURE dbo.spExpediente_Update
  @id INT,
  @fiscalia NVARCHAR(200) = NULL,
  @unidad NVARCHAR(200) = NULL,
  @descripcion NVARCHAR(MAX) = NULL,
  @ubicacion_texto NVARCHAR(200) = NULL,
  @municipio NVARCHAR(100) = NULL,
  @departamento NVARCHAR(100) = NULL
AS
BEGIN
  SET NOCOUNT ON;

  DECLARE @estado NVARCHAR(20);
  SELECT @estado = estado FROM dbo.EXPEDIENTE WHERE CodigoExpediente=@id;
  IF @estado IS NULL THROW 50030, ''Expediente no existe'', 1;
  IF @estado IN (N''EnRevision'', N''Aprobado'')
    THROW 50031, ''No editable en EnRevision/Aprobado'', 1;

  UPDATE dbo.EXPEDIENTE
     SET fiscalia = COALESCE(@fiscalia, fiscalia),
         unidad = COALESCE(@unidad, unidad),
         descripcion = COALESCE(@descripcion, descripcion),
         ubicacion_texto = COALESCE(@ubicacion_texto, ubicacion_texto),
         municipio = COALESCE(@municipio, municipio),
         departamento = COALESCE(@departamento, departamento),
         actualizado_en = SYSUTCDATETIME()
   WHERE CodigoExpediente=@id;

  EXEC dbo.spExpediente_GetById @id=@id;
END
');

/* ENVIAR A REVISION: requiere al menos 1 indicio */
EXEC(N'
CREATE OR ALTER PROCEDURE dbo.spExpediente_SendToReview
  @id INT,
  @coordinadorId INT
AS
BEGIN
  SET NOCOUNT ON;

  DECLARE @estado NVARCHAR(20);
  SELECT @estado = estado FROM dbo.EXPEDIENTE WHERE CodigoExpediente=@id;
  IF @estado IS NULL THROW 50032, ''Expediente no existe'', 1;
  IF @estado = N''Aprobado''
    THROW 50033, ''No se puede enviar: ya Aprobado'', 1;

  IF NOT EXISTS(SELECT 1 FROM dbo.INDICIO WHERE CodigoExpediente=@id)
    THROW 50034, ''Debe registrar al menos un indicio'', 1;

  UPDATE dbo.EXPEDIENTE
     SET estado = N''EnRevision'',
         CodigoCoordinador = @coordinadorId,
         actualizado_en = SYSUTCDATETIME()
   WHERE CodigoExpediente=@id;

  EXEC dbo.spExpediente_GetById @id=@id;
END
');

/* RECHAZAR: requiere justificación y estado EnRevision */
EXEC(N'
CREATE OR ALTER PROCEDURE dbo.spExpediente_Reject
  @id INT,
  @justificacion NVARCHAR(MAX),
  @decididoPor INT
AS
BEGIN
  SET NOCOUNT ON;

  DECLARE @estado NVARCHAR(20);
  SELECT @estado = estado FROM dbo.EXPEDIENTE WHERE CodigoExpediente=@id;
  IF @estado IS NULL THROW 50035, ''Expediente no existe'', 1;
  IF @estado <> N''EnRevision'' THROW 50036, ''Solo rechazable en EnRevision'', 1;
  IF @justificacion IS NULL OR LEN(LTRIM(RTRIM(@justificacion))) < 10
    THROW 50037, ''Justificación obligatoria (>=10 caracteres)'', 1;

  INSERT INTO dbo.DECISION(CodigoExpediente, tipo, justificacion, decidido_por, decidido_en)
  VALUES (@id, N''Rechazado'', @justificacion, @decididoPor, SYSUTCDATETIME());

  UPDATE dbo.EXPEDIENTE
     SET estado = N''Rechazado'',
         actualizado_en = SYSUTCDATETIME()
   WHERE CodigoExpediente=@id;

  EXEC dbo.spExpediente_GetById @id=@id;
END
');

/* APROBAR: solo EnRevision */
EXEC(N'
CREATE OR ALTER PROCEDURE dbo.spExpediente_Approve
  @id INT,
  @decididoPor INT
AS
BEGIN
  SET NOCOUNT ON;

  DECLARE @estado NVARCHAR(20);
  SELECT @estado = estado FROM dbo.EXPEDIENTE WHERE CodigoExpediente=@id;
  IF @estado IS NULL THROW 50038, ''Expediente no existe'', 1;
  IF @estado <> N''EnRevision'' THROW 50039, ''Solo aprobable en EnRevision'', 1;

  INSERT INTO dbo.DECISION(CodigoExpediente, tipo, justificacion, decidido_por, decidido_en)
  VALUES (@id, N''Aprobado'', NULL, @decididoPor, SYSUTCDATETIME());

  UPDATE dbo.EXPEDIENTE
     SET estado = N''Aprobado'',
         actualizado_en = SYSUTCDATETIME()
   WHERE CodigoExpediente=@id;

  EXEC dbo.spExpediente_GetById @id=@id;
END
');
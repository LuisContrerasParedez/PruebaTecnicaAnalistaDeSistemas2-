IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name='IX_ADJ_Entidad' AND object_id=OBJECT_ID('dbo.ADJUNTO'))
  CREATE INDEX IX_ADJ_Entidad ON dbo.ADJUNTO(entidad, entidad_id);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name='IX_ADJ_SubidoPor' AND object_id=OBJECT_ID('dbo.ADJUNTO'))
  CREATE INDEX IX_ADJ_SubidoPor ON dbo.ADJUNTO(subido_por);

/* LIST */
EXEC(N'
CREATE OR ALTER PROCEDURE dbo.spAdjunto_List
  @entidad NVARCHAR(50),
  @entidadId INT,
  @page INT = 1,
  @pageSize INT = 20
AS
BEGIN
  SET NOCOUNT ON;
  IF @page < 1 SET @page = 1;
  IF @pageSize < 1 SET @pageSize = 20;

  SELECT a.CodigoAdjunto, a.entidad, a.entidad_id, a.nombre_archivo, a.ruta, a.tipo_mime,
         a.tamano_bytes, a.hash_opcional, a.subido_por, a.subido_en,
         u.nombre AS subido_por_nombre,
         COUNT(*) OVER() AS total_count
  FROM dbo.ADJUNTO a
  JOIN dbo.USUARIO u ON u.CodigoUsuario = a.subido_por
  WHERE a.entidad = @entidad AND a.entidad_id = @entidadId
  ORDER BY a.CodigoAdjunto DESC
  OFFSET (@page-1)*@pageSize ROWS FETCH NEXT @pageSize ROWS ONLY;
END
');

/* GET BY ID */
EXEC(N'
CREATE OR ALTER PROCEDURE dbo.spAdjunto_GetById
  @id INT
AS
BEGIN
  SET NOCOUNT ON;
  SELECT TOP 1 a.*, u.nombre AS subido_por_nombre
  FROM dbo.ADJUNTO a
  JOIN dbo.USUARIO u ON u.CodigoUsuario = a.subido_por
  WHERE a.CodigoAdjunto = @id;
END
');

/* CREATE (valida entidad y existencia) */
EXEC(N'
CREATE OR ALTER PROCEDURE dbo.spAdjunto_Create
  @entidad NVARCHAR(50),
  @entidadId INT,
  @nombre_archivo NVARCHAR(300),
  @ruta NVARCHAR(400),
  @tipo_mime NVARCHAR(100),
  @tamano_bytes INT,
  @hash_opcional NVARCHAR(128) = NULL,
  @subido_por INT
AS
BEGIN
  SET NOCOUNT ON;

  DECLARE @ok BIT = 0;
  IF UPPER(@entidad) = N''EXPEDIENTE'' AND EXISTS(SELECT 1 FROM dbo.EXPEDIENTE WHERE CodigoExpediente=@entidadId) SET @ok=1;
  IF UPPER(@entidad) = N''INDICIO''    AND EXISTS(SELECT 1 FROM dbo.INDICIO    WHERE CodigoIndicio=@entidadId)    SET @ok=1;
  IF UPPER(@entidad) = N''USUARIO''    AND EXISTS(SELECT 1 FROM dbo.USUARIO    WHERE CodigoUsuario=@entidadId)   SET @ok=1;

  IF @ok = 0 THROW 50070, ''Entidad o entidad_id no válidos'', 1;

  INSERT INTO dbo.ADJUNTO(entidad, entidad_id, nombre_archivo, ruta, tipo_mime,
                          tamano_bytes, hash_opcional, subido_por, subido_en)
  VALUES(UPPER(@entidad), @entidadId, @nombre_archivo, @ruta, @tipo_mime,
         @tamano_bytes, @hash_opcional, @subido_por, SYSUTCDATETIME());

  DECLARE @id INT = SCOPE_IDENTITY();
  EXEC dbo.spAdjunto_GetById @id=@id;
END
');

/* UPDATE (metadatos) */
EXEC(N'
CREATE OR ALTER PROCEDURE dbo.spAdjunto_Update
  @id INT,
  @nombre_archivo NVARCHAR(300) = NULL,
  @ruta NVARCHAR(400) = NULL,
  @tipo_mime NVARCHAR(100) = NULL,
  @tamano_bytes INT = NULL,
  @hash_opcional NVARCHAR(128) = NULL
AS
BEGIN
  SET NOCOUNT ON;
  IF NOT EXISTS(SELECT 1 FROM dbo.ADJUNTO WHERE CodigoAdjunto=@id)
    THROW 50071, ''Adjunto no existe'', 1;

  UPDATE dbo.ADJUNTO
     SET nombre_archivo = COALESCE(@nombre_archivo, nombre_archivo),
         ruta           = COALESCE(@ruta, ruta),
         tipo_mime      = COALESCE(@tipo_mime, tipo_mime),
         tamano_bytes   = COALESCE(@tamano_bytes, tamano_bytes),
         hash_opcional  = COALESCE(@hash_opcional, hash_opcional)
   WHERE CodigoAdjunto=@id;

  EXEC dbo.spAdjunto_GetById @id=@id;
END
');

/* DELETE */
EXEC(N'
CREATE OR ALTER PROCEDURE dbo.spAdjunto_Delete
  @id INT
AS
BEGIN
  SET NOCOUNT ON;
  DELETE FROM dbo.ADJUNTO WHERE CodigoAdjunto=@id;
  SELECT @@ROWCOUNT AS affected;
END
');
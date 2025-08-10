IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name='IX_CAT_Tipo' AND object_id=OBJECT_ID('dbo.CATALOGO'))
  CREATE INDEX IX_CAT_Tipo ON dbo.CATALOGO(tipo);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name='UQ_CATALOGO_tipo_valor' AND object_id=OBJECT_ID('dbo.CATALOGO'))
  CREATE UNIQUE INDEX UQ_CATALOGO_tipo_valor ON dbo.CATALOGO(tipo, valor);

-- LIST
EXEC(N'
CREATE OR ALTER PROCEDURE dbo.spCatalogo_List
  @tipo NVARCHAR(100) = NULL,
  @q NVARCHAR(200) = NULL,
  @activo BIT = NULL,
  @page INT = 1,
  @pageSize INT = 20
AS
BEGIN
  SET NOCOUNT ON;
  IF @page < 1 SET @page = 1;
  IF @pageSize < 1 SET @pageSize = 20;

  SELECT c.CodigoCatalogo, c.tipo, c.valor, c.activo,
         COUNT(*) OVER() AS total_count
  FROM dbo.CATALOGO c
  WHERE (@tipo IS NULL OR c.tipo = @tipo)
    AND (@q IS NULL OR c.valor LIKE ''%''+@q+''%'')
    AND (@activo IS NULL OR c.activo = @activo)
  ORDER BY c.CodigoCatalogo DESC
  OFFSET (@page-1)*@pageSize ROWS FETCH NEXT @pageSize ROWS ONLY;
END
');

-- GET BY ID
EXEC(N'
CREATE OR ALTER PROCEDURE dbo.spCatalogo_GetById
  @id INT
AS
BEGIN
  SET NOCOUNT ON;
  SELECT CodigoCatalogo, tipo, valor, activo
  FROM dbo.CATALOGO
  WHERE CodigoCatalogo = @id;
END
');

-- CREATE
EXEC(N'
CREATE OR ALTER PROCEDURE dbo.spCatalogo_Create
  @tipo NVARCHAR(100),
  @valor NVARCHAR(200),
  @activo BIT = 1
AS
BEGIN
  SET NOCOUNT ON;
  IF EXISTS(SELECT 1 FROM dbo.CATALOGO WHERE tipo=@tipo AND valor=@valor)
    THROW 50020, ''Ya existe un registro con el mismo tipo y valor'', 1;

  INSERT INTO dbo.CATALOGO(tipo, valor, activo)
  VALUES (@tipo, @valor, @activo);

  DECLARE @id INT = SCOPE_IDENTITY();
  EXEC dbo.spCatalogo_GetById @id=@id;
END
');

-- UPDATE (parcial)
EXEC(N'
CREATE OR ALTER PROCEDURE dbo.spCatalogo_Update
  @id INT,
  @tipo NVARCHAR(100) = NULL,
  @valor NVARCHAR(200) = NULL,
  @activo BIT = NULL
AS
BEGIN
  SET NOCOUNT ON;

  IF (@tipo IS NOT NULL OR @valor IS NOT NULL)
  BEGIN
    DECLARE @t NVARCHAR(100) = COALESCE(@tipo, (SELECT tipo FROM dbo.CATALOGO WHERE CodigoCatalogo=@id));
    DECLARE @v NVARCHAR(200) = COALESCE(@valor, (SELECT valor FROM dbo.CATALOGO WHERE CodigoCatalogo=@id));

    IF EXISTS(SELECT 1 FROM dbo.CATALOGO WHERE tipo=@t AND valor=@v AND CodigoCatalogo<>@id)
      THROW 50021, ''Duplicado: (tipo, valor) ya existe'', 1;
  END

  UPDATE dbo.CATALOGO
     SET tipo   = COALESCE(@tipo, tipo),
         valor  = COALESCE(@valor, valor),
         activo = COALESCE(@activo, activo)
   WHERE CodigoCatalogo=@id;

  EXEC dbo.spCatalogo_GetById @id=@id;
END
');

-- SET ACTIVO
EXEC(N'
CREATE OR ALTER PROCEDURE dbo.spCatalogo_SetActivo
  @id INT,
  @activo BIT
AS
BEGIN
  SET NOCOUNT ON;
  UPDATE dbo.CATALOGO SET activo=@activo WHERE CodigoCatalogo=@id;
  EXEC dbo.spCatalogo_GetById @id=@id;
END
');

--  DELETE . 
EXEC(N'
CREATE OR ALTER PROCEDURE dbo.spCatalogo_Delete
  @id INT
AS
BEGIN
  SET NOCOUNT ON;
  DELETE FROM dbo.CATALOGO WHERE CodigoCatalogo=@id;
  SELECT @@ROWCOUNT AS affected;
END
');
IF COL_LENGTH('dbo.USUARIO','password_hash') IS NULL
  ALTER TABLE dbo.USUARIO ADD password_hash NVARCHAR(255) NULL;

-- LIST
EXEC(N'
CREATE OR ALTER PROCEDURE dbo.spUsuario_List
  @q NVARCHAR(200)=NULL,
  @rol INT=NULL,
  @activo BIT=NULL,
  @page INT=1,
  @pageSize INT=20
AS
BEGIN
  SET NOCOUNT ON;
  IF @page < 1 SET @page = 1;
  IF @pageSize < 1 SET @pageSize = 20;

  SELECT u.CodigoUsuario, u.nombre, u.correo, u.CodigoRol,
         r.nombre AS rol_nombre, u.unidad, u.activo,
         u.creado_en, u.actualizado_en,
         COUNT(*) OVER() AS total_count
  FROM dbo.USUARIO u
  JOIN dbo.ROL r ON r.CodigoRol = u.CodigoRol
  WHERE (@q IS NULL OR u.nombre LIKE ''%''+@q+''%'' OR u.correo LIKE ''%''+@q+''%'' OR u.unidad LIKE ''%''+@q+''%'')
    AND (@rol IS NULL OR u.CodigoRol = @rol)
    AND (@activo IS NULL OR u.activo = @activo)
  ORDER BY u.CodigoUsuario DESC
  OFFSET (@page-1)*@pageSize ROWS FETCH NEXT @pageSize ROWS ONLY;
END
');

-- GET BY ID
EXEC(N'
CREATE OR ALTER PROCEDURE dbo.spUsuario_GetById
  @id INT
AS
BEGIN
  SET NOCOUNT ON;
  SELECT u.CodigoUsuario, u.nombre, u.correo, u.CodigoRol,
         r.nombre AS rol_nombre, u.unidad, u.activo,
         u.creado_en, u.actualizado_en
  FROM dbo.USUARIO u
  JOIN dbo.ROL r ON r.CodigoRol = u.CodigoRol
  WHERE u.CodigoUsuario = @id;
END
');

-- CREATE
EXEC(N'
CREATE OR ALTER PROCEDURE dbo.spUsuario_Create
  @nombre NVARCHAR(200),
  @correo NVARCHAR(255),
  @codigoRol INT,
  @unidad NVARCHAR(200) = NULL,
  @activo BIT = 1,
  @passwordHash NVARCHAR(255) = NULL
AS
BEGIN
  SET NOCOUNT ON;
  IF EXISTS (SELECT 1 FROM dbo.USUARIO WHERE correo=@correo)
    THROW 50001, ''Correo ya existe'', 1;

  INSERT INTO dbo.USUARIO(nombre, correo, CodigoRol, unidad, activo, password_hash, creado_en, actualizado_en)
  VALUES(@nombre, @correo, @codigoRol, @unidad, @activo, @passwordHash, SYSUTCDATETIME(), SYSUTCDATETIME());

  DECLARE @id INT = SCOPE_IDENTITY();
  EXEC dbo.spUsuario_GetById @id=@id;
END
');

-- UPDATE (parcial)
EXEC(N'
CREATE OR ALTER PROCEDURE dbo.spUsuario_Update
  @id INT,
  @nombre NVARCHAR(200) = NULL,
  @correo NVARCHAR(255) = NULL,
  @codigoRol INT = NULL,
  @unidad NVARCHAR(200) = NULL,
  @activo BIT = NULL
AS
BEGIN
  SET NOCOUNT ON;

  IF @correo IS NOT NULL AND EXISTS(SELECT 1 FROM dbo.USUARIO WHERE correo=@correo AND CodigoUsuario<>@id)
    THROW 50002, ''Correo ya existe en otro usuario'', 1;

  UPDATE dbo.USUARIO
     SET nombre       = COALESCE(@nombre, nombre),
         correo       = COALESCE(@correo, correo),
         CodigoRol    = COALESCE(@codigoRol, CodigoRol),
         unidad       = COALESCE(@unidad, unidad),
         activo       = COALESCE(@activo, activo),
         actualizado_en = SYSUTCDATETIME()
   WHERE CodigoUsuario = @id;

  EXEC dbo.spUsuario_GetById @id=@id;
END
');

-- ACTIVAR/DESACTIVAR
EXEC(N'
CREATE OR ALTER PROCEDURE dbo.spUsuario_SetActivo
  @id INT,
  @activo BIT
AS
BEGIN
  SET NOCOUNT ON;
  UPDATE dbo.USUARIO
     SET activo=@activo, actualizado_en=SYSUTCDATETIME()
   WHERE CodigoUsuario=@id;

  EXEC dbo.spUsuario_GetById @id=@id;
END
');

-- SET PASSWORD
EXEC(N'
CREATE OR ALTER PROCEDURE dbo.spUsuario_SetPassword
  @id INT,
  @passwordHash NVARCHAR(255)
AS
BEGIN
  SET NOCOUNT ON;
  UPDATE dbo.USUARIO
     SET password_hash=@passwordHash, actualizado_en=SYSUTCDATETIME()
   WHERE CodigoUsuario=@id;

  SELECT CodigoUsuario AS id FROM dbo.USUARIO WHERE CodigoUsuario=@id;
END
');
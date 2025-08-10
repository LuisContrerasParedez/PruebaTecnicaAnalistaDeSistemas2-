-- LIST
EXEC(N'
CREATE OR ALTER PROCEDURE dbo.spRol_List
  @q NVARCHAR(200) = NULL,
  @page INT = 1,
  @pageSize INT = 20
AS
BEGIN
  SET NOCOUNT ON;
  IF @page < 1 SET @page = 1;
  IF @pageSize < 1 SET @pageSize = 20;

  SELECT r.CodigoRol, r.nombre, r.permisos,
         COUNT(*) OVER() AS total_count
  FROM dbo.ROL r
  WHERE (@q IS NULL OR r.nombre LIKE ''%''+@q+''%'')
  ORDER BY r.CodigoRol DESC
  OFFSET (@page-1)*@pageSize ROWS FETCH NEXT @pageSize ROWS ONLY;
END
');

-- GET BY ID
EXEC(N'
CREATE OR ALTER PROCEDURE dbo.spRol_GetById
  @id INT
AS
BEGIN
  SET NOCOUNT ON;
  SELECT CodigoRol, nombre, permisos
  FROM dbo.ROL
  WHERE CodigoRol = @id;
END
');

-- CREATE
EXEC(N'
CREATE OR ALTER PROCEDURE dbo.spRol_Create
  @nombre NVARCHAR(200),
  @permisos NVARCHAR(MAX) = NULL
AS
BEGIN
  SET NOCOUNT ON;

  IF EXISTS(SELECT 1 FROM dbo.ROL WHERE nombre=@nombre)
    THROW 50003, ''Rol ya existe'', 1;

  INSERT INTO dbo.ROL(nombre, permisos)
  VALUES (@nombre, @permisos);

  DECLARE @id INT = SCOPE_IDENTITY();
  EXEC dbo.spRol_GetById @id=@id;
END
');

-- UPDATE (parcial)
EXEC(N'
CREATE OR ALTER PROCEDURE dbo.spRol_Update
  @id INT,
  @nombre NVARCHAR(200) = NULL,
  @permisos NVARCHAR(MAX) = NULL
AS
BEGIN
  SET NOCOUNT ON;

  IF @nombre IS NOT NULL
     AND EXISTS(SELECT 1 FROM dbo.ROL WHERE nombre=@nombre AND CodigoRol<>@id)
     THROW 50004, ''Nombre de rol ya existe'', 1;

  UPDATE dbo.ROL
     SET nombre   = COALESCE(@nombre, nombre),
         permisos = COALESCE(@permisos, permisos)
   WHERE CodigoRol=@id;

  EXEC dbo.spRol_GetById @id=@id;
END
');

-- DELETE (segura: no permite borrar si está en uso)
EXEC(N'
CREATE OR ALTER PROCEDURE dbo.spRol_Delete
  @id INT
AS
BEGIN
  SET NOCOUNT ON;

  IF EXISTS(SELECT 1 FROM dbo.USUARIO WHERE CodigoRol=@id)
    THROW 50010, ''No se puede eliminar: rol en uso por usuarios'', 1;

  DELETE FROM dbo.ROL WHERE CodigoRol=@id;
  SELECT @@ROWCOUNT AS affected;
END
');
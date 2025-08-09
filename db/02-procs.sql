-- Insertar
IF OBJECT_ID(N'dbo.sp_Accion_Insert', N'P') IS NOT NULL DROP PROC dbo.sp_Accion_Insert;
GO
CREATE PROC dbo.sp_Accion_Insert
  @Nombre NVARCHAR(100),
  @Descripcion NVARCHAR(255) = NULL
AS
BEGIN
  SET NOCOUNT ON;
  INSERT INTO dbo.Acciones (Nombre, Descripcion) VALUES (@Nombre, @Descripcion);
  SELECT SCOPE_IDENTITY() AS NewId;
END
GO

-- Actualizar
IF OBJECT_ID(N'dbo.sp_Accion_Update', N'P') IS NOT NULL DROP PROC dbo.sp_Accion_Update;
GO
CREATE PROC dbo.sp_Accion_Update
  @Id INT,
  @Nombre NVARCHAR(100),
  @Descripcion NVARCHAR(255) = NULL
AS
BEGIN
  SET NOCOUNT ON;
  UPDATE dbo.Acciones SET Nombre=@Nombre, Descripcion=@Descripcion WHERE Id=@Id;
  SELECT @@ROWCOUNT AS Affected;
END
GO

-- Eliminar
IF OBJECT_ID(N'dbo.sp_Accion_Delete', N'P') IS NOT NULL DROP PROC dbo.sp_Accion_Delete;
GO
CREATE PROC dbo.sp_Accion_Delete
  @Id INT
AS
BEGIN
  SET NOCOUNT ON;
  DELETE FROM dbo.Acciones WHERE Id=@Id;
  SELECT @@ROWCOUNT AS Affected;
END
GO

-- Consultar uno
IF OBJECT_ID(N'dbo.sp_Accion_GetById', N'P') IS NOT NULL DROP PROC dbo.sp_Accion_GetById;
GO
CREATE PROC dbo.sp_Accion_GetById
  @Id INT
AS
BEGIN
  SET NOCOUNT ON;
  SELECT * FROM dbo.Acciones WHERE Id=@Id;
END
GO

-- Listar
IF OBJECT_ID(N'dbo.sp_Accion_List', N'P') IS NOT NULL DROP PROC dbo.sp_Accion_List;
GO
CREATE PROC dbo.sp_Accion_List
AS
BEGIN
  SET NOCOUNT ON;
  SELECT * FROM dbo.Acciones ORDER BY Id DESC;
END
GO

IF COL_LENGTH('dbo.USUARIO','password_hash') IS NULL
  ALTER TABLE dbo.USUARIO ADD password_hash NVARCHAR(255) NULL;

IF OBJECT_ID('dbo.SESION','U') IS NULL
BEGIN
  CREATE TABLE dbo.SESION(
    CodigoSesion INT IDENTITY(1,1) PRIMARY KEY,
    CodigoUsuario INT NOT NULL,
    refresh_token_hash NVARCHAR(255) NOT NULL,
    created_at DATETIME2 NOT NULL CONSTRAINT DF_SESION_created DEFAULT (SYSUTCDATETIME()),
    expires_at DATETIME2 NOT NULL,
    revoked_at DATETIME2 NULL,
    ip NVARCHAR(64) NULL,
    user_agent NVARCHAR(256) NULL,
    CONSTRAINT FK_SESION_USUARIO FOREIGN KEY (CodigoUsuario)
      REFERENCES dbo.USUARIO(CodigoUsuario)
      ON UPDATE NO ACTION ON DELETE NO ACTION
  );
  CREATE UNIQUE INDEX UX_SESION_refresh_hash ON dbo.SESION(refresh_token_hash);
  CREATE INDEX IX_SESION_usuario ON dbo.SESION(CodigoUsuario, revoked_at);
END;

EXEC(N'
CREATE OR ALTER PROCEDURE dbo.spAuth_GetUserByEmail
  @correo NVARCHAR(255)
AS
BEGIN
  SET NOCOUNT ON;
  SELECT  u.CodigoUsuario, u.nombre, u.correo, u.activo, u.CodigoRol,
          r.nombre AS rol_nombre,
          u.password_hash
  FROM dbo.USUARIO u
  JOIN dbo.ROL r ON r.CodigoRol = u.CodigoRol
  WHERE u.correo = @correo;
END
');

EXEC(N'
CREATE OR ALTER PROCEDURE dbo.spAuth_CreateSession
  @UsuarioId INT,
  @RefreshHash NVARCHAR(255),
  @ExpiresAt DATETIME2,
  @Ip NVARCHAR(64) = NULL,
  @UserAgent NVARCHAR(256) = NULL
AS
BEGIN
  SET NOCOUNT ON;
  INSERT INTO dbo.SESION(CodigoUsuario, refresh_token_hash, expires_at, ip, user_agent)
  VALUES (@UsuarioId, @RefreshHash, @ExpiresAt, @Ip, @UserAgent);
  SELECT SCOPE_IDENTITY() AS CodigoSesion;
END
');

EXEC(N'
CREATE OR ALTER PROCEDURE dbo.spAuth_GetSessionByHash
  @RefreshHash NVARCHAR(255)
AS
BEGIN
  SET NOCOUNT ON;
  SELECT s.CodigoSesion, s.CodigoUsuario, s.created_at, s.expires_at, s.revoked_at,
         u.CodigoUsuario AS UsuarioId, u.nombre, u.correo, u.activo, u.CodigoRol,
         r.nombre AS rol_nombre,
         s.refresh_token_hash
  FROM dbo.SESION s
  JOIN dbo.USUARIO u ON u.CodigoUsuario = s.CodigoUsuario
  JOIN dbo.ROL r ON r.CodigoRol = u.CodigoRol
  WHERE s.refresh_token_hash = @RefreshHash;
END
');

EXEC(N'
CREATE OR ALTER PROCEDURE dbo.spAuth_RevokeSession
  @RefreshHash NVARCHAR(255)
AS
BEGIN
  SET NOCOUNT ON;
  UPDATE dbo.SESION
    SET revoked_at = SYSUTCDATETIME()
  WHERE refresh_token_hash = @RefreshHash AND revoked_at IS NULL;
  SELECT @@ROWCOUNT AS affected;
END
');

EXEC(N'
CREATE OR ALTER PROCEDURE dbo.spAuth_ListActiveSessionsByUser
  @UsuarioId INT
AS
BEGIN
  SET NOCOUNT ON;
  SELECT s.refresh_token_hash, s.expires_at, s.revoked_at,
         s.CodigoUsuario AS UsuarioId,
         u.correo, u.nombre, u.CodigoRol, r.nombre AS rol_nombre
  FROM dbo.SESION s
  JOIN dbo.USUARIO u ON u.CodigoUsuario = s.CodigoUsuario
  JOIN dbo.ROL r ON r.CodigoRol = u.CodigoRol
  WHERE s.CodigoUsuario = @UsuarioId
    AND s.revoked_at IS NULL
    AND s.expires_at > SYSUTCDATETIME();
END
');
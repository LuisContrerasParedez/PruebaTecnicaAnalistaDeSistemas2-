BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[USUARIO] ADD [password_hash] NVARCHAR(255);

-- CreateTable
CREATE TABLE [dbo].[SESION] (
    [CodigoSesion] INT NOT NULL IDENTITY(1,1),
    [CodigoUsuario] INT NOT NULL,
    [refresh_token_hash] NVARCHAR(255) NOT NULL,
    [created_at] DATETIME2 NOT NULL CONSTRAINT [SESION_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [expires_at] DATETIME2 NOT NULL,
    [revoked_at] DATETIME2,
    [ip] NVARCHAR(64),
    [user_agent] NVARCHAR(256),
    CONSTRAINT [SESION_pkey] PRIMARY KEY CLUSTERED ([CodigoSesion]),
    CONSTRAINT [UX_SESION_refresh_hash] UNIQUE NONCLUSTERED ([refresh_token_hash])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_SESION_usuario] ON [dbo].[SESION]([CodigoUsuario], [revoked_at]);

-- AddForeignKey
ALTER TABLE [dbo].[SESION] ADD CONSTRAINT [SESION_CodigoUsuario_fkey] FOREIGN KEY ([CodigoUsuario]) REFERENCES [dbo].[USUARIO]([CodigoUsuario]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH

/*
  Warnings:

  - You are about to drop the `Acciones` table. If the table is not empty, all the data it contains will be lost.

*/
BEGIN TRY

BEGIN TRAN;

-- DropTable
DROP TABLE [dbo].[Acciones];

-- CreateTable
CREATE TABLE [dbo].[ROL] (
    [CodigoRol] INT NOT NULL IDENTITY(1,1),
    [nombre] NVARCHAR(1000) NOT NULL,
    [permisos] NVARCHAR(max),
    CONSTRAINT [ROL_pkey] PRIMARY KEY CLUSTERED ([CodigoRol])
);

-- CreateTable
CREATE TABLE [dbo].[USUARIO] (
    [CodigoUsuario] INT NOT NULL IDENTITY(1,1),
    [nombre] NVARCHAR(1000) NOT NULL,
    [correo] NVARCHAR(1000) NOT NULL,
    [CodigoRol] INT NOT NULL,
    [unidad] NVARCHAR(1000),
    [activo] BIT NOT NULL CONSTRAINT [USUARIO_activo_df] DEFAULT 1,
    [creado_en] DATETIME2 NOT NULL CONSTRAINT [USUARIO_creado_en_df] DEFAULT CURRENT_TIMESTAMP,
    [actualizado_en] DATETIME2 NOT NULL,
    CONSTRAINT [USUARIO_pkey] PRIMARY KEY CLUSTERED ([CodigoUsuario]),
    CONSTRAINT [USUARIO_correo_key] UNIQUE NONCLUSTERED ([correo])
);

-- CreateTable
CREATE TABLE [dbo].[EXPEDIENTE] (
    [CodigoExpediente] INT NOT NULL IDENTITY(1,1),
    [no_expediente] NVARCHAR(1000) NOT NULL,
    [fiscalia] NVARCHAR(1000),
    [unidad] NVARCHAR(1000),
    [descripcion] NVARCHAR(max),
    [ubicacion_texto] NVARCHAR(1000),
    [municipio] NVARCHAR(1000),
    [departamento] NVARCHAR(1000),
    [estado] NVARCHAR(1000) NOT NULL CONSTRAINT [EXPEDIENTE_estado_df] DEFAULT 'Borrador',
    [CodigoTecnico] INT NOT NULL,
    [CodigoCoordinador] INT,
    [creado_en] DATETIME2 NOT NULL CONSTRAINT [EXPEDIENTE_creado_en_df] DEFAULT CURRENT_TIMESTAMP,
    [actualizado_en] DATETIME2 NOT NULL,
    CONSTRAINT [EXPEDIENTE_pkey] PRIMARY KEY CLUSTERED ([CodigoExpediente]),
    CONSTRAINT [EXPEDIENTE_no_expediente_key] UNIQUE NONCLUSTERED ([no_expediente])
);

-- CreateTable
CREATE TABLE [dbo].[INDICIO] (
    [CodigoIndicio] INT NOT NULL IDENTITY(1,1),
    [CodigoExpediente] INT NOT NULL,
    [codigo_indicio] NVARCHAR(1000) NOT NULL,
    [tipo] NVARCHAR(1000) NOT NULL,
    [descripcion] NVARCHAR(max),
    [color] NVARCHAR(1000),
    [tamano] NVARCHAR(1000),
    [peso] DECIMAL(10,2),
    [ubicacion] NVARCHAR(1000),
    [CodigoTecnico] INT NOT NULL,
    [fecha_hora] DATETIME2 NOT NULL,
    [observaciones] NVARCHAR(max),
    [creado_en] DATETIME2 NOT NULL CONSTRAINT [INDICIO_creado_en_df] DEFAULT CURRENT_TIMESTAMP,
    [actualizado_en] DATETIME2 NOT NULL,
    CONSTRAINT [INDICIO_pkey] PRIMARY KEY CLUSTERED ([CodigoIndicio]),
    CONSTRAINT [UQ_IND_Exp_Cod] UNIQUE NONCLUSTERED ([CodigoExpediente],[codigo_indicio])
);

-- CreateTable
CREATE TABLE [dbo].[DECISION] (
    [CodigoDecision] INT NOT NULL IDENTITY(1,1),
    [CodigoExpediente] INT NOT NULL,
    [tipo] NVARCHAR(1000) NOT NULL CONSTRAINT [DECISION_tipo_df] DEFAULT 'Aprobado',
    [justificacion] NVARCHAR(max),
    [decidido_por] INT NOT NULL,
    [decidido_en] DATETIME2 NOT NULL,
    CONSTRAINT [DECISION_pkey] PRIMARY KEY CLUSTERED ([CodigoDecision])
);

-- CreateTable
CREATE TABLE [dbo].[ADJUNTO] (
    [CodigoAdjunto] INT NOT NULL IDENTITY(1,1),
    [entidad] NVARCHAR(1000) NOT NULL,
    [entidad_id] INT NOT NULL,
    [nombre_archivo] NVARCHAR(1000) NOT NULL,
    [ruta] NVARCHAR(1000) NOT NULL,
    [tipo_mime] NVARCHAR(1000) NOT NULL,
    [tamano_bytes] INT NOT NULL,
    [hash_opcional] NVARCHAR(1000),
    [subido_por] INT NOT NULL,
    [subido_en] DATETIME2 NOT NULL CONSTRAINT [ADJUNTO_subido_en_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [ADJUNTO_pkey] PRIMARY KEY CLUSTERED ([CodigoAdjunto])
);

-- CreateTable
CREATE TABLE [dbo].[BITACORA] (
    [CodigoBitacora] INT NOT NULL IDENTITY(1,1),
    [CodigoUsuario] INT NOT NULL,
    [accion] NVARCHAR(1000) NOT NULL,
    [entidad] NVARCHAR(1000) NOT NULL,
    [entidad_id] INT NOT NULL,
    [detalle_json] NVARCHAR(max),
    [ip] NVARCHAR(1000),
    [creado_en] DATETIME2 NOT NULL CONSTRAINT [BITACORA_creado_en_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [BITACORA_pkey] PRIMARY KEY CLUSTERED ([CodigoBitacora])
);

-- CreateTable
CREATE TABLE [dbo].[CATALOGO] (
    [CodigoCatalogo] INT NOT NULL IDENTITY(1,1),
    [tipo] NVARCHAR(1000) NOT NULL,
    [valor] NVARCHAR(1000) NOT NULL,
    [activo] BIT NOT NULL CONSTRAINT [CATALOGO_activo_df] DEFAULT 1,
    CONSTRAINT [CATALOGO_pkey] PRIMARY KEY CLUSTERED ([CodigoCatalogo])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_USUARIO_CodigoRol] ON [dbo].[USUARIO]([CodigoRol]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_EXP_CodTecnico] ON [dbo].[EXPEDIENTE]([CodigoTecnico]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_EXP_CodCoordinador] ON [dbo].[EXPEDIENTE]([CodigoCoordinador]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_EXP_Estado] ON [dbo].[EXPEDIENTE]([estado]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_IND_CodExp] ON [dbo].[INDICIO]([CodigoExpediente]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_IND_CodTec] ON [dbo].[INDICIO]([CodigoTecnico]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_DEC_CodExp] ON [dbo].[DECISION]([CodigoExpediente]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_DEC_DecPor] ON [dbo].[DECISION]([decidido_por]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_ADJ_Entidad] ON [dbo].[ADJUNTO]([entidad], [entidad_id]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_ADJ_SubidoPor] ON [dbo].[ADJUNTO]([subido_por]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_BIT_CodUsuario] ON [dbo].[BITACORA]([CodigoUsuario]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_BIT_Entidad] ON [dbo].[BITACORA]([entidad], [entidad_id]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_CAT_Tipo] ON [dbo].[CATALOGO]([tipo]);

-- AddForeignKey
ALTER TABLE [dbo].[USUARIO] ADD CONSTRAINT [USUARIO_CodigoRol_fkey] FOREIGN KEY ([CodigoRol]) REFERENCES [dbo].[ROL]([CodigoRol]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[EXPEDIENTE] ADD CONSTRAINT [EXPEDIENTE_CodigoTecnico_fkey] FOREIGN KEY ([CodigoTecnico]) REFERENCES [dbo].[USUARIO]([CodigoUsuario]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[EXPEDIENTE] ADD CONSTRAINT [EXPEDIENTE_CodigoCoordinador_fkey] FOREIGN KEY ([CodigoCoordinador]) REFERENCES [dbo].[USUARIO]([CodigoUsuario]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[INDICIO] ADD CONSTRAINT [INDICIO_CodigoExpediente_fkey] FOREIGN KEY ([CodigoExpediente]) REFERENCES [dbo].[EXPEDIENTE]([CodigoExpediente]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[INDICIO] ADD CONSTRAINT [INDICIO_CodigoTecnico_fkey] FOREIGN KEY ([CodigoTecnico]) REFERENCES [dbo].[USUARIO]([CodigoUsuario]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[DECISION] ADD CONSTRAINT [DECISION_CodigoExpediente_fkey] FOREIGN KEY ([CodigoExpediente]) REFERENCES [dbo].[EXPEDIENTE]([CodigoExpediente]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[DECISION] ADD CONSTRAINT [DECISION_decidido_por_fkey] FOREIGN KEY ([decidido_por]) REFERENCES [dbo].[USUARIO]([CodigoUsuario]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[ADJUNTO] ADD CONSTRAINT [ADJUNTO_subido_por_fkey] FOREIGN KEY ([subido_por]) REFERENCES [dbo].[USUARIO]([CodigoUsuario]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[BITACORA] ADD CONSTRAINT [BITACORA_CodigoUsuario_fkey] FOREIGN KEY ([CodigoUsuario]) REFERENCES [dbo].[USUARIO]([CodigoUsuario]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH

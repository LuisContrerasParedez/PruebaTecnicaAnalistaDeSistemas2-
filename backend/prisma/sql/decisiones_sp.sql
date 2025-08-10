IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name='IX_DEC_CodExp' AND object_id=OBJECT_ID('dbo.DECISION'))
  CREATE INDEX IX_DEC_CodExp ON dbo.DECISION(CodigoExpediente);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name='IX_DEC_DecPor' AND object_id=OBJECT_ID('dbo.DECISION'))
  CREATE INDEX IX_DEC_DecPor ON dbo.DECISION(decidido_por);

/* LIST */
EXEC(N'
CREATE OR ALTER PROCEDURE dbo.spDecision_List
  @expedienteId INT = NULL,
  @tipo NVARCHAR(20) = NULL,           -- Aprobado|Rechazado
  @desde DATETIME2 = NULL,
  @hasta DATETIME2 = NULL,
  @decididoPor INT = NULL,
  @page INT = 1,
  @pageSize INT = 20
AS
BEGIN
  SET NOCOUNT ON;
  IF @page < 1 SET @page = 1;
  IF @pageSize < 1 SET @pageSize = 20;

  SELECT d.CodigoDecision, d.CodigoExpediente, d.tipo, d.justificacion,
         d.decidido_por, d.decidido_en,
         e.no_expediente, e.estado,
         u.nombre AS decidido_por_nombre,
         COUNT(*) OVER() AS total_count
  FROM dbo.DECISION d
  JOIN dbo.EXPEDIENTE e ON e.CodigoExpediente = d.CodigoExpediente
  JOIN dbo.USUARIO u ON u.CodigoUsuario = d.decidido_por
  WHERE (@expedienteId IS NULL OR d.CodigoExpediente = @expedienteId)
    AND (@tipo IS NULL OR d.tipo = @tipo)
    AND (@desde IS NULL OR d.decidido_en >= @desde)
    AND (@hasta IS NULL OR d.decidido_en < DATEADD(DAY,1,@hasta))
    AND (@decididoPor IS NULL OR d.decidido_por = @decididoPor)
  ORDER BY d.CodigoDecision DESC
  OFFSET (@page-1)*@pageSize ROWS FETCH NEXT @pageSize ROWS ONLY;
END
');

/* GET BY ID */
EXEC(N'
CREATE OR ALTER PROCEDURE dbo.spDecision_GetById
  @id INT
AS
BEGIN
  SET NOCOUNT ON;
  SELECT TOP 1 d.CodigoDecision, d.CodigoExpediente, d.tipo, d.justificacion,
         d.decidido_por, d.decidido_en,
         e.no_expediente, e.estado,
         u.nombre AS decidido_por_nombre
  FROM dbo.DECISION d
  JOIN dbo.EXPEDIENTE e ON e.CodigoExpediente = d.CodigoExpediente
  JOIN dbo.USUARIO u ON u.CodigoUsuario = d.decidido_por
  WHERE d.CodigoDecision = @id;
END
');
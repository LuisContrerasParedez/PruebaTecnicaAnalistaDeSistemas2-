// src/index.js
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import accionesRoutes from './routes/acciones.routes.js';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './docs/swagger.js';

// Prisma
import { prisma } from './prisma.js';

// --- Paths ESM (Windows friendly) ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- App ---
const app = express();
app.set('trust proxy', true);

// Views (EJS) en ../views
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Home (vista simple para ver el puerto)
app.get('/', (_req, res) => {
  res.render('index', { port: process.env.PORT || 4000 });
});

// Swagger UI
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));

// Rutas API
app.use('/api/acciones', accionesRoutes);

// Health simple
app.get('/api/health', (_req, res) => res.json({ ok: true }));

// Health con DB (útil para k8s/compose)
app.get('/api/health/db', async (_req, res) => {
  try {
    const [{ ok }] = await prisma.$queryRaw`SELECT CAST(1 AS INT) AS ok`;
    res.json({ ok: true, db: ok === 1 });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// 404
app.use((req, res, _next) => {
  res.status(404).json({ error: 'Not Found', path: req.originalUrl });
});

app.use((err, _req, res, _next) => {
  console.error('❌ Error:', err);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

// --- Server ---
const PORT = process.env.PORT || 4000;

// Comprobar DB antes de levantar (opcional pero recomendado)
(async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Conectado a SQL Server con Prisma');
  } catch (err) {
    console.error('❌ Error conectando a la base con Prisma:', err);
    process.exit(1);
  }

  const server = app.listen(PORT, () => {
    console.log(`API on http://localhost:${PORT}`);
  });

  // Shutdown limpio
  const shutdown = async (signal) => {
    console.log(`\n${signal} recibido. Cerrando HTTP...`);
    server.close(async () => {
      try {
        await prisma.$disconnect();
        console.log('🗄️  Prisma desconectado.');
      } finally {
        process.exit(0);
      }
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
})();

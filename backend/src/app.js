// src/app.js
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './docs/swagger.js';
import { prisma } from './lib/prisma.js';

// rutas
import authRoutes from './modules/auth/auth.routes.js';
import usuariosRoutes from './modules/usuarios/usuarios.routes.js';
import rolesRoutes from './modules/roles/roles.routes.js';
import catalogosRoutes from './modules/catalogos/catalogo.routes.js';



const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();
app.set('trust proxy', true);

// Views (EJS)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Home
app.get('/', (_req, res) => {
  res.render('index', { port: process.env.PORT || 4000 });
});

// Swagger
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));

// Rutas API
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/roles', rolesRoutes);
app.use('/api/catalogos', catalogosRoutes);

// Para el resto de módulos cuando los tengas agrupados:
// app.use('/api', apiRoutes);

// Health
app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.get('/api/health/db', async (_req, res) => {
  try {
    const [{ ok }] = await prisma.$queryRaw`SELECT CAST(1 AS INT) AS ok`;
    res.json({ ok: true, db: ok === 1 });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// 404 y errores
app.use((req, res) => res.status(404).json({ error: 'Not Found', path: req.originalUrl }));
app.use((err, _req, res, _next) => {
  console.error('❌ Error:', err);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

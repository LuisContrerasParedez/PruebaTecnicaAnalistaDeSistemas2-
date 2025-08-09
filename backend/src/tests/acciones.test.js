import request from 'supertest';
import express from 'express';
import accionesRoutes from '../routes/acciones.routes.js';

const app = express();
app.use(express.json());
app.use('/api/acciones', accionesRoutes);

// Mockear db si quieres; aquí solo verifica que existan rutas
test('GET /api/acciones responde 200 o 500', async () => {
  const res = await request(app).get('/api/acciones');
  expect([200,500]).toContain(res.statusCode);
});

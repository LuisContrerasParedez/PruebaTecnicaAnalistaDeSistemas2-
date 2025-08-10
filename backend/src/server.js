// src/server.js
import 'dotenv/config';
import { app } from './app.js';
import { prisma } from './lib/prisma.js';

const PORT = process.env.PORT || 4000;

(async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('Conectado a SQL Server con Prisma');
  } catch (err) {
    console.error('Error conectando a la base con Prisma:', err);
    process.exit(1);
  }

  const server = app.listen(PORT, () => {
    console.log(`API on http://localhost:${PORT}`);
  });

  const shutdown = async (signal) => {
    console.log(`\n${signal} recibido. Cerrando HTTP...`);
    server.close(async () => {
      try { await prisma.$disconnect(); } finally { process.exit(0); }
    });
  };
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
})();

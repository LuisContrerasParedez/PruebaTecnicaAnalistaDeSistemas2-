// backend/src/db.js
import sql from 'mssql';

const config = {
  server: process.env.SQL_HOST || 'db',
  user: process.env.SQL_USER || 'sa',
  password: process.env.SQL_PASSWORD,
  database: process.env.SQL_DATABASE,
  port: 1433,
  options: {
    trustServerCertificate: true,
    encrypt: process.env.SQL_ENCRYPT === 'true', // en dev pon SQL_ENCRYPT=false
  },
  pool: { max: 10, min: 0, idleTimeoutMillis: 30000 },
};

let pool;

async function connectWithRetry(retries = 10, delayMs = 2000) {
  for (let i = 1; i <= retries; i++) {
    try {
      return await sql.connect(config);
    } catch (err) {
      console.error(`DB connect intento ${i}/${retries}: ${err.message}`);
      if (i === retries) throw err;
      await new Promise(r => setTimeout(r, delayMs));
    }
  }
}

export async function getPool() {
  if (!pool) pool = await connectWithRetry();
  return pool;
}

export { sql };

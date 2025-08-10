import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().url().or(z.string().startsWith('sqlserver://')),
  JWT_SECRET: z.string().min(8),
});

export const env = envSchema.parse(process.env);

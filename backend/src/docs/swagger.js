// src/docs/swagger.js
import swaggerJsdoc from 'swagger-jsdoc';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const options = {
  definition: {
    openapi: '3.0.1',
    info: { title: 'API Acciones', version: '1.0.0' },
    servers: [{ url: '/api' }],
    components: {
      schemas: {
        Accion: {
          type: 'object',
          properties: {
            id:            { type: 'integer', example: 1 },
            nombre:        { type: 'string',  example: 'Nueva acción' },
            descripcion:   { type: 'string',  nullable: true, example: 'Descripción opcional' },
            fechaCreacion: { type: 'string',  format: 'date-time' }
          }
        },
        AccionCreate: {
          type: 'object',
          required: ['nombre'],
          properties: {
            nombre: { type: 'string' },
            descripcion: { type: 'string', nullable: true }
          }
        },
        AccionUpdate: {
          type: 'object',
          properties: {
            nombre: { type: 'string' },
            descripcion: { type: 'string', nullable: true }
          }
        }
      }
    }
  },
  apis: [path.resolve(process.cwd(), 'src/modules/**/*.routes.js')],
};

export const swaggerSpec = swaggerJsdoc(options);

// src/docs/swagger.js
import swaggerJsdoc from 'swagger-jsdoc';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const options = {
  definition: {
    openapi: '3.0.1',
    info: { title: 'API DICRI', version: '1.0.0' },
    servers: [{ url: '/api' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        // ---- Auth ----
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'admin.csii@mp.gob.gt' },
            password: { type: 'string', example: 'MiPass#2025' }
          }
        },
        LoginResponse: {
          type: 'object',
          properties: {
            user: {
              type: 'object',
              properties: {
                id: { type: 'integer', example: 1 },
                nombre: { type: 'string', example: 'Admin CSII' },
                correo: { type: 'string', example: 'admin.csii@mp.gob.gt' },
                rol: { type: 'string', example: 'Administrador' }
              }
            },
            accessToken: { type: 'string' },
            refreshToken: { type: 'string' }
          }
        },
        RefreshRequest: {
          type: 'object',
          required: ['refreshToken'],
          properties: { refreshToken: { type: 'string' } }
        },
        RefreshResponse: {
          type: 'object',
          properties: {
            accessToken: { type: 'string' },
            refreshToken: { type: 'string' }
          }
        },
        LogoutRequest: {
          type: 'object',
          required: ['refreshToken'],
          properties: { refreshToken: { type: 'string' } }
        },

        // ---- Tus ejemplos previos (opcional) ----
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
    },
    tags: [{ name: 'Auth' }]
  },
  // asegúrate de que el glob apunte a tus rutas ESM
  apis: [path.resolve(process.cwd(), 'src/modules/**/*.routes.js')],
};

export const swaggerSpec = swaggerJsdoc(options);

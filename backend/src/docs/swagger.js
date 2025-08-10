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
        // ---- Usuarios ----
        Usuario: {
          type: 'object',
          properties: {
            CodigoUsuario: { type: 'integer' },
            nombre: { type: 'string' },
            correo: { type: 'string' },
            CodigoRol: { type: 'integer' },
            rol_nombre: { type: 'string' },
            unidad: { type: 'string', nullable: true },
            activo: { type: 'boolean' },
            creado_en: { type: 'string', format: 'date-time' },
            actualizado_en: { type: 'string', format: 'date-time' }
          }
        },
        UsuarioCreate: {
          type: 'object',
          required: ['nombre', 'correo', 'codigoRol'],
          properties: {
            nombre: { type: 'string' },
            correo: { type: 'string', format: 'email' },
            codigoRol: { type: 'integer' },
            unidad: { type: 'string', nullable: true },
            activo: { type: 'boolean', default: true },
            password: { type: 'string', nullable: true }
          }
        },
        UsuarioUpdate: {
          type: 'object',
          properties: {
            nombre: { type: 'string' },
            unidad: { type: 'string', nullable: true },
            activo: { type: 'boolean' },
            codigoRol: { type: 'integer' }
          }
        },
        UsuarioSetPassword: {
          type: 'object',
          required: ['password'],
          properties: { password: { type: 'string' } }
        },
        Rol: {
          type: 'object',
          properties: {
            CodigoRol: { type: 'integer' },
            nombre: { type: 'string' },
            permisos: { type: 'string', description: 'JSON o texto' }
          }
        },
        RolCreate: {
          type: 'object',
          required: ['nombre'],
          properties: {
            nombre: { type: 'string' },
            permisos: { oneOf: [{ type: 'string' }, { type: 'object' }, { type: 'array' }] }
          }
        },
        RolUpdate: {
          type: 'object',
          properties: {
            nombre: { type: 'string' },
            permisos: { oneOf: [{ type: 'string' }, { type: 'object' }, { type: 'array' }] }
          }
        },
        Catalogo: {
          type: 'object',
          properties: {
            CodigoCatalogo: { type: 'integer' },
            tipo: { type: 'string', example: 'color' },
            valor: { type: 'string', example: 'Rojo' },
            activo: { type: 'boolean', example: true }
          }
        },
        CatalogoCreate: {
          type: 'object',
          required: ['tipo', 'valor'],
          properties: {
            tipo: { type: 'string', example: 'tipo_indicio' },
            valor: { type: 'string', example: 'Arma blanca' },
            activo: { type: 'boolean', default: true }
          }
        },
        CatalogoUpdate: {
          type: 'object',
          properties: {
            tipo: { type: 'string' },
            valor: { type: 'string' },
            activo: { type: 'boolean' }
          }
        },

        Expediente: {
          type: 'object',
          properties: {
            CodigoExpediente: { type: 'integer' },
            no_expediente: { type: 'string', example: 'DICRI-2025-000123' },
            fiscalia: { type: 'string' },
            unidad: { type: 'string' },
            descripcion: { type: 'string' },
            ubicacion_texto: { type: 'string' },
            municipio: { type: 'string' },
            departamento: { type: 'string' },
            estado: { type: 'string', enum: ['Borrador', 'EnRevision', 'Rechazado', 'Aprobado'] },
            CodigoTecnico: { type: 'integer' },
            CodigoCoordinador: { type: 'integer', nullable: true },
            creado_en: { type: 'string', format: 'date-time' },
            actualizado_en: { type: 'string', format: 'date-time' },
            tecnico_nombre: { type: 'string' },
            coordinador_nombre: { type: 'string', nullable: true }
          }
        },
        ExpedienteCreate: {
          type: 'object',
          properties: {
            fiscalia: { type: 'string' },
            unidad: { type: 'string' },
            descripcion: { type: 'string' },
            ubicacion_texto: { type: 'string' },
            municipio: { type: 'string' },
            departamento: { type: 'string' },
            codigoTecnico: { type: 'integer', description: 'Si no hay auth, envía aquí el técnico' }
          }
        },
        ExpedienteUpdate: {
          type: 'object',
          properties: {
            fiscalia: { type: 'string' },
            unidad: { type: 'string' },
            descripcion: { type: 'string' },
            ubicacion_texto: { type: 'string' },
            municipio: { type: 'string' },
            departamento: { type: 'string' }
          }
        },
        ExpedienteSendToReview: {
          type: 'object',
          required: ['coordinadorId'],
          properties: { coordinadorId: { type: 'integer' } }
        },
        ExpedienteReject: {
          type: 'object',
          required: ['justificacion'],
          properties: { justificacion: { type: 'string', minLength: 10 } }
        },





        // ---- Tus ejemplos previos (opcional) ----
        Accion: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            nombre: { type: 'string', example: 'Nueva acción' },
            descripcion: { type: 'string', nullable: true, example: 'Descripción opcional' },
            fechaCreacion: { type: 'string', format: 'date-time' }
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

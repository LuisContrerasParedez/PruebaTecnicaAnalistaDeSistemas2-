import swaggerJSDoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: { title: 'API Acciones', version: '1.0.0' },
    servers: [{ url: 'http://localhost:4000/api' }]
  },
  apis: ['./src/routes/*.js'],
};

export const swaggerSpec = swaggerJSDoc(options);

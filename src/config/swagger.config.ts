import swaggerJsdoc from 'swagger-jsdoc';
import appConfig from './app.config.js';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: appConfig.name,
      version: appConfig.version,
      description:
        'Production-grade B2B Wholesale Ordering Platform API for FMCG distributors. ' +
        'Feature modules are scaffolded; business logic will be added incrementally.',
      contact: {
        name: 'Goyal Wholesale Engineering',
      },
    },
    servers: [
      {
        url: `http://localhost:${appConfig.port}${appConfig.apiPrefix}`,
        description: 'Local development',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        ApiSuccess: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string' },
            data: { type: 'object' },
            meta: { type: 'object' },
          },
        },
        ApiError: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            errors: {
              type: 'array',
              items: { type: 'object' },
            },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/modules/**/routes/*.ts', './src/routes/*.ts', './dist/modules/**/routes/*.js'],
};

export const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;

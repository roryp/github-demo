import { zodToJsonSchema } from 'zod-to-json-schema';
import { loginSchema, loginResponseSchema } from '../src/routes/auth.js';
import { userSchema, userListSchema } from '../src/routes/users.js';

export const openApiSpec = {
  openapi: '3.1.0',
  info: {
    title: 'github-app-demo API',
    version: '0.1.0',
    description: 'Auto-generated from route-level zod schemas.',
  },
  servers: [{ url: 'http://localhost:3000', description: 'Local dev' }],
  paths: {
    '/api/health': {
      get: {
        summary: 'Health check',
        responses: {
          '200': {
            description: 'Service healthy',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { status: { type: 'string', example: 'ok' } },
                  required: ['status'],
                },
              },
            },
          },
        },
      },
    },
    '/api/auth/login': {
      post: {
        summary: 'Authenticate a user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: zodToJsonSchema(loginSchema, { target: 'openApi3' }),
            },
          },
        },
        responses: {
          '200': {
            description: 'Authenticated',
            content: {
              'application/json': {
                schema: zodToJsonSchema(loginResponseSchema, { target: 'openApi3' }),
              },
            },
          },
          '400': { description: 'Invalid request body' },
          '401': { description: 'Invalid credentials' },
        },
      },
    },
    '/api/users': {
      get: {
        summary: 'List users',
        responses: {
          '200': {
            description: 'User list',
            content: {
              'application/json': {
                schema: zodToJsonSchema(userListSchema, { target: 'openApi3' }),
              },
            },
          },
        },
      },
    },
    '/api/users/{id}': {
      get: {
        summary: 'Get a single user',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'User found',
            content: {
              'application/json': {
                schema: zodToJsonSchema(userSchema, { target: 'openApi3' }),
              },
            },
          },
          '404': { description: 'User not found' },
        },
      },
    },
  },
} as const;

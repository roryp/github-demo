import { zodToJsonSchema } from 'zod-to-json-schema';
import { loginSchema, loginResponseSchema } from './routes/auth.js';
import { userSchema, userListSchema } from './routes/users.js';

export function generateSpec(): object {
  const loginBody = zodToJsonSchema(loginSchema, { target: 'openApi3' });
  const loginResp = zodToJsonSchema(loginResponseSchema, { target: 'openApi3' });
  const userResp = zodToJsonSchema(userSchema, { target: 'openApi3' });
  const userListResp = zodToJsonSchema(userListSchema, { target: 'openApi3' });

  return {
    openapi: '3.1.0',
    info: {
      title: 'GitHub App Demo API',
      version: '0.1.0',
      description: 'Small Express + TS demo API',
    },
    paths: {
      '/api/auth/login': {
        post: {
          summary: 'Authenticate a user',
          operationId: 'login',
          tags: ['Auth'],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: loginBody } },
          },
          responses: {
            '200': {
              description: 'Successful login',
              content: { 'application/json': { schema: loginResp } },
            },
            '400': {
              description: 'Invalid request body',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: { error: { type: 'string' } },
                  },
                },
              },
            },
            '401': {
              description: 'Invalid credentials',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: { error: { type: 'string' } },
                  },
                },
              },
            },
          },
        },
      },
      '/api/users': {
        get: {
          summary: 'List all users',
          operationId: 'listUsers',
          tags: ['Users'],
          responses: {
            '200': {
              description: 'A list of users',
              content: { 'application/json': { schema: userListResp } },
            },
          },
        },
      },
      '/api/users/{id}': {
        get: {
          summary: 'Get a user by ID',
          operationId: 'getUserById',
          tags: ['Users'],
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
              description: 'The requested user',
              content: { 'application/json': { schema: userResp } },
            },
            '404': {
              description: 'User not found',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: { error: { type: 'string' } },
                  },
                },
              },
            },
          },
        },
      },
      '/api/health': {
        get: {
          summary: 'Health check',
          operationId: 'healthCheck',
          tags: ['Health'],
          responses: {
            '200': {
              description: 'Service is healthy',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: { status: { type: 'string' } },
                  },
                },
              },
            },
          },
        },
      },
    },
  };
}

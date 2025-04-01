// examples/basic-usage.ts
const { createEnvValidator }=require('./src/index')

// Set some environment variables for the example
process.env.PORT = '3000';
process.env.API_KEY = 'xyz123';
process.env.DEBUG = 'true';
process.env.DATABASE_CONFIG = '{"host":"localhost","port":5432}';
process.env.ALLOWED_ORIGINS = 'http://localhost:3000,https://example.com';

const env = createEnvValidator({
  PORT: { 
    type: 'number', 
    required: true,
    min: 1,
    max: 65535 
  },
  API_KEY: { 
    type: 'string', 
    required: true,
    pattern: /^[a-z0-9]+$/i
  },
  DEBUG: { 
    type: 'boolean', 
    default: false 
  },
  NODE_ENV: { 
    type: 'enum',
    enum: ['development', 'production', 'test'],
    default: 'development'
  },
  DATABASE_CONFIG: {
    type: 'object',
    properties: {
      host: { type: 'string', required: true },
      port: { type: 'number', default: 5432 },
      username: { type: 'string', default: 'postgres' },
      password: { type: 'string' }
    }
  },
  ALLOWED_ORIGINS: {
    type: 'array',
    items: { type: 'string', pattern: /^https?:\/\// }
  },
  CUSTOM_SETTING: {
    type: 'string',
    default: 'default-value',
    transform: (value) => value.toUpperCase(),
    validate: (value) => {
      if (value.length < 3) return 'Value must be at least 3 characters';
      return true;
    }
  }
}, undefined, {
  logLevel: 'warn',
  strict: true
});

console.log('Environment Configuration:');
console.log('--------------------------');
console.log('PORT:', env.PORT, `(type: ${typeof env.PORT})`);
console.log('API_KEY:', env.API_KEY, `(type: ${typeof env.API_KEY})`);
console.log('DEBUG:', env.DEBUG, `(type: ${typeof env.DEBUG})`);
console.log('NODE_ENV:', env.NODE_ENV, `(type: ${typeof env.NODE_ENV})`);
console.log('DATABASE_CONFIG:', env.DATABASE_CONFIG);
console.log('ALLOWED_ORIGINS:', env.ALLOWED_ORIGINS);
console.log('CUSTOM_SETTING:', env.CUSTOM_SETTING);
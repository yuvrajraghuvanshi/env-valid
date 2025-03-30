# env-validator

A TypeScript-based environment variable validator with advanced features for Node.js applications.

## Features

- ✅ **Strong typing** with TypeScript support
- 🔄 **Type conversion** for strings, numbers, booleans, arrays, objects, and enums
- ⚠️ **Validation** with detailed error messages
- 🔒 **Default values** for missing environment variables
- 🔍 **Pattern matching** using regular expressions
- 📏 **Range validation** for numbers and string/array lengths
- 🧩 **Custom transformations** and validations
- 🔍 **Strict mode** to detect unexpected environment variables
- 📝 **Detailed logging** with configurable log levels

## Installation

```bash
npm install env-validator
```

## Basic Usage

```typescript
import { createEnvValidator } from 'env-validator';

// Define your schema
const env = createEnvValidator({
  PORT: { type: 'number', required: true, min: 1, max: 65535 },
  API_KEY: { type: 'string', required: true },
  DEBUG: { type: 'boolean', default: false },
  NODE_ENV: { 
    type: 'enum',
    enum: ['development', 'production', 'test'],
    default: 'development'
  }
});

// Use your validated environment variables
const server = app.listen(env.PORT, () => {
  console.log(`Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
});
```

## Advanced Features

### Array Validation

```typescript
const env = createEnvValidator({
  ALLOWED_ORIGINS: {
    type: 'array',
    items: { type: 'string', pattern: /^https?:\/\// }
  }
});
// From: process.env.ALLOWED_ORIGINS = 'http://localhost:3000,https://example.com'
// Result: env.ALLOWED_ORIGINS = ['http://localhost:3000', 'https://example.com']
```

### Object Validation

```typescript
const env = createEnvValidator({
  DATABASE_CONFIG: {
    type: 'object',
    properties: {
      host: { type: 'string', required: true },
      port: { type: 'number', default: 5432 },
      username: { type: 'string', default: 'postgres' },
      password: { type: 'string' }
    }
  }
});
// From: process.env.DATABASE_CONFIG = '{"host":"localhost","port":5432}'
// Result: env.DATABASE_CONFIG = { host: 'localhost', port: 5432, username: 'postgres' }
```

### Custom Transformations

```typescript
const env = createEnvValidator({
  APP_SECRET: {
    type: 'string',
    transform: (value) => value.toUpperCase(),
    validate: (value) => value.length >= 10 || 'Secret must be at least 10 characters'
  }
});
```

### Configuration Options

```typescript
const env = createEnvValidator(
  schema,
  // Optional: provide custom env vars (useful for testing)
  { TEST_VAR: 'custom-value' },
  // Options
  {
    strict: true, // Error on undefined env vars
    logLevel: 'warn', // One of: 'error', 'warn', 'info', 'none'
    ignoreProcessEnv: false, // If true, only use the provided env vars
    allowNull: false // If true, allow null values for required fields
  }
);
```

## Validation Schema Types

| Type | Description | Example Config |
|------|-------------|----------------|
| `string` | Text values | `{ type: 'string', min: 3, max: 100, pattern: /^[A-Z]+$/ }` |
| `number` | Numeric values | `{ type: 'number', min: 0, max: 1000 }` |
| `boolean` | True/false values | `{ type: 'boolean', default: false }` |
| `array` | List of values | `{ type: 'array', items: { type: 'number' } }` |
| `object` | JSON objects | `{ type: 'object', properties: { ... } }` |
| `enum` | Value from a set | `{ type: 'enum', enum: ['a', 'b', 'c'] }` |

## License

MIT
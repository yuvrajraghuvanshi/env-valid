// test/validator.test.ts
import { createEnvValidator } from '../src';

describe('createEnvValidator', () => {
  // Original environment variables
  const originalEnv = process.env;
  
  beforeEach(() => {
    // Clear and reset process.env before each test
    process.env = { ...originalEnv };
    jest.resetModules();
  });
  
  afterAll(() => {
    // Restore original env after all tests
    process.env = originalEnv;
  });
  
  test('validates string type', () => {
    process.env.TEST_STRING = 'hello';
    
    const env = createEnvValidator({
      TEST_STRING: { type: 'string', required: true }
    });
    
    expect(env.TEST_STRING).toBe('hello');
  });
  
  test('validates number type', () => {
    process.env.TEST_NUMBER = '123';
    
    const env = createEnvValidator({
      TEST_NUMBER: { type: 'number', required: true }
    });
    
    expect(env.TEST_NUMBER).toBe(123);
    expect(typeof env.TEST_NUMBER).toBe('number');
  });
  
  test('validates boolean type', () => {
    process.env.TEST_BOOL_TRUE = 'true';
    process.env.TEST_BOOL_YES = 'yes';
    process.env.TEST_BOOL_1 = '1';
    process.env.TEST_BOOL_FALSE = 'false';
    
    const env = createEnvValidator({
      TEST_BOOL_TRUE: { type: 'boolean' },
      TEST_BOOL_YES: { type: 'boolean' },
      TEST_BOOL_1: { type: 'boolean' },
      TEST_BOOL_FALSE: { type: 'boolean' }
    });
    
    expect(env.TEST_BOOL_TRUE).toBe(true);
    expect(env.TEST_BOOL_YES).toBe(true);
    expect(env.TEST_BOOL_1).toBe(true);
    expect(env.TEST_BOOL_FALSE).toBe(false);
  });
  
  test('validates array type', () => {
    process.env.TEST_ARRAY_CSV = 'a,b,c';
    process.env.TEST_ARRAY_JSON = '['x', 'y', 'z']';
    
    const env = createEnvValidator({
      TEST_ARRAY_CSV: { type: 'array' },
      TEST_ARRAY_JSON: { type: 'array' }
    });
    
    expect(env.TEST_ARRAY_CSV).toEqual(['a', 'b', 'c']);
    expect(env.TEST_ARRAY_JSON).toEqual(['x', 'y', 'z']);
  });
  
  test('validates object type', () => {
    process.env.TEST_OBJECT = '{'name':'test','value':42}';
    
    const env = createEnvValidator({
      TEST_OBJECT: { 
        type: 'object',
        properties: {
          name: { type: 'string', required: true },
          value: { type: 'number', required: true }
        }
      }
    });
    
    expect(env.TEST_OBJECT).toEqual({ name: 'test', value: 42 });
  });
  
  test('validates enum type', () => {
    process.env.TEST_ENUM = 'production';
    
    const env = createEnvValidator({
      TEST_ENUM: { 
        type: 'enum', 
        enum: ['development', 'production', 'test'] 
      }
    });
    
    expect(env.TEST_ENUM).toBe('production');
  });
  
  test('throws error for invalid enum value', () => {
    process.env.TEST_ENUM = 'invalid';
    
    expect(() => {
      createEnvValidator({
        TEST_ENUM: { 
          type: 'enum', 
          enum: ['development', 'production', 'test'] 
        }
      });
    }).toThrow();
  });
  
  test('uses default values when env var is not provided', () => {
    const env = createEnvValidator({
      MISSING_VAR: { type: 'string', default: 'default-value' },
      MISSING_NUMBER: { type: 'number', default: 42 },
      MISSING_BOOL: { type: 'boolean', default: true }
    });
    
    expect(env.MISSING_VAR).toBe('default-value');
    expect(env.MISSING_NUMBER).toBe(42);
    expect(env.MISSING_BOOL).toBe(true);
  });
  
  test('throws error for required fields', () => {
    expect(() => {
      createEnvValidator({
        REQUIRED_FIELD: { type: 'string', required: true }
      });
    }).toThrow();
  });
  
  test('custom transform works', () => {
    process.env.TRANSFORM_TEST = 'hello';
    
    const env = createEnvValidator({
      TRANSFORM_TEST: { 
        type: 'string', 
        transform: (val) => val.toUpperCase() 
      }
    });
    
    expect(env.TRANSFORM_TEST).toBe('HELLO');
  });
  
  test('custom validation works', () => {
    process.env.VALID = 'valid-value';
    process.env.INVALID = 'invalid';
    
    const schema = {
      VALID: { 
        type: 'string', 
        validate: (val) => val.startsWith('valid') || 'Must start with valid' 
      },
      INVALID: { 
        type: 'string', 
        validate: (val) => val.startsWith('valid') || 'Must start with valid' 
      }
    };
    
    // Valid case should pass
    const validEnv = createEnvValidator({
      VALID: schema.VALID
    });
    expect(validEnv.VALID).toBe('valid-value');
    
    // Invalid case should throw
    expect(() => {
      createEnvValidator({
        INVALID: schema.INVALID
      });
    }).toThrow(/Must start with valid/);
  });
  
  test('type validation with min/max constraints', () => {
    process.env.STRING_LENGTH = 'hello';
    process.env.NUMBER_RANGE = '42';
    
    // Valid case
    const validEnv = createEnvValidator({
      STRING_LENGTH: { type: 'string', min: 3, max: 10 },
      NUMBER_RANGE: { type: 'number', min: 0, max: 100 }
    });
    
    expect(validEnv.STRING_LENGTH).toBe('hello');
    expect(validEnv.NUMBER_RANGE).toBe(42);
    
    // Invalid cases
    process.env.STRING_TOO_LONG = 'this is too long for the constraint';
    process.env.NUMBER_TOO_BIG = '200';
    
    expect(() => {
      createEnvValidator({
        STRING_TOO_LONG: { type: 'string', max: 10 }
      });
    }).toThrow();
    
    expect(() => {
      createEnvValidator({
        NUMBER_TOO_BIG: { type: 'number', max: 100 }
      });
    }).toThrow();
  });
});
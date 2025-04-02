import { EnvValidatorOptions, ValidatedEnv, ValidationSchema } from './types';
import { convertToType, logger } from './utils';

const DEFAULT_OPTIONS: EnvValidatorOptions = {
  strict: false,
  logLevel: 'error',
  ignoreProcessEnv: false,
  allowNull: false,
};

export function createEnvValidator<T extends ValidationSchema>(
  schema: T,
  environmentVars: Record<string, string> = {}, // Made optional with default empty object
  options: Partial<EnvValidatorOptions> = {}
): ValidatedEnv<T> {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options, logLevel: options.logLevel || 'error' };
  const envVars =
    typeof process !== 'undefined' && !mergedOptions.ignoreProcessEnv
      ? { ...process.env, ...environmentVars }
      : environmentVars;

  const result: Record<string, any> = {};
  const errors: string[] = [];
  const warnings: string[] = [];

  // Strict mode: Warn about extra environment variables not in schema
  if (mergedOptions.strict) {
    Object.keys(envVars).forEach((key) => {
      if (!schema[key]) {
        warnings.push(`${key} is not a valid environment variable`);
      }
    });
  }

  // Validate each schema entry
  for (const [key, config] of Object.entries(schema)) {
    try {
      const value = envVars[key];
      if (config.required && value === undefined) {
        throw new Error(`Environment variable ${key} is required but not set.`);
      }
      if (value !== undefined) {
        result[key] = convertToType(value, config);
      } else if (config.default !== undefined) {
        result[key] = config.default;
      } else if (mergedOptions.allowNull) {
        result[key] = null; // Allow null if specified in options
      } else {
        result[key] = undefined;
      }
    } catch (error: any) {
      errors.push(`${key}: ${error.message}`);
    }
  }

  // Log warnings
  warnings.forEach((warning) => {
    logger('warn', warning, { logLevel: mergedOptions.logLevel });
  });

  // Handle errors
  if (errors.length > 0) {
    const errorMessage = `Environment validation failed:\n${errors.join('\n')}`;
    logger('error', errorMessage, { logLevel: mergedOptions.logLevel });
    throw new Error(errorMessage);
  }

  return Object.freeze(result) as ValidatedEnv<T>;
}
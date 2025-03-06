export interface ValidationSchema{
    [key: string]: ValidationConfig;
}

export interface ValidationConfig {
  type: "string"|"boolean"|"number"|"array"|"object"|"enum";
  required?: boolean;
  default?:any;
  enum?:any[
  ];
  pattern?: RegExp;
  min?: number;
  max?: number;
  items?:ValidationConfig;
  allowNull?: boolean;
  properties?: ValidationSchema;
  transform?:(value:any)=>any;
  errorMessage?: string;
  validate?:(value:any)=>boolean | string;
}

export interface EnvValidatorOptions{
    strict?: boolean;
    logLevel?:'error'|'warn'|'info'|'none';
    ignoreProcessEnv?:boolean;
    allowNull?:boolean;
}

export type ValidatedEnv<T extends ValidationSchema> = {
    [K in keyof T]: ReturnType<typeof convertToType<T[K]['type']>>;
}
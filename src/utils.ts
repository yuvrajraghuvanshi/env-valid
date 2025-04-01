import { ValidationConfig } from './types';


export function convertToType(value:string,config:ValidationConfig):any {
    const {type} = config;
    if(value === undefined||value === null|| value === ''){
        if(config.required && !config.allowNull){
            throw new Error('Value is required and cannot be null or empty');
        }
        return config.default !== undefined ? config.default:undefined;
    }

    try{
        let converted:any;
        switch(type){
            case 'string':
                converted = String(value);
                if(config.pattern&& !config.pattern.test(converted)){
                    throw new Error(`Invalid value for ${config.errorMessage || config.type}: ${value}`);
                }
                if(config.min && converted.length < config.min){
                    throw new Error(`String should be atleast equal to ${config.min}`);
                }
                if(config.max && converted.length > config.max){
                    throw new Error(`String should not exceed  ${config.max}`);
                }
                break;
            case 'boolean':
                const lower=value.toLowerCase();
                if(['true','y','yes','1'].includes(lower)){
                    converted = true;
                }
                else if(['false','n','no','0'].includes(lower)){
                    converted = false;
                }
                else{
                    throw new Error(`Invalid boolean value for ${config.errorMessage || config.type}: ${value}`);
                }
               
                break;
            case 'number':
                converted = Number(value);
                if(isNaN(converted)){
                    throw new Error(`Invalid number value for ${config.errorMessage || config.type}: ${value}`);
                }
                if(config.min && converted < config.min){
                    throw new Error(`Number should be atleast equal to ${config.min}`);
                }
                if(config.max && converted > config.max){
                    throw new Error(`Number should not exceed  ${config.max}`);
                }
                break;
            case 'array':
              converted=value.startsWith('[')? JSON.parse(value): value.split(',').map(v=>v.trim());
              if(config.items){
                    converted.forEach((item:any)=> typeof item === 'string' ? convertToType(item, config.items as ValidationConfig) : item
              )
                }
                if (config.min !== undefined && converted.length < config.min) {
                    throw new Error(`Array should have at least ${config.min} items`);
                  }
                  if (config.max !== undefined && converted.length > config.max) {
                    throw new Error(`Array should not have more than ${config.max} items`);
                  }
                break;
            case 'object':
                converted = typeof value === 'object' ? value : (JSON.parse(value));
                if(config.properties){
                    for(const [propKey,propConfig] of Object.entries(config.properties)){
                        if(converted[propKey]!==undefined){
                          converted[propKey]=  convertToType(converted[propKey],propConfig);
                        }else if (propConfig.required) {
                            throw new Error(`Required property ${propKey} is missing`);
                          } else if (propConfig.default !== undefined) {
                            converted[propKey] = propConfig.default;
                          }
                    }
                }
                break;
            case 'enum':
                if(!config.enum || !Array.isArray(config.enum)) {
                    throw new Error('Enum validation requires an enum array in config');
                }
                if (!config.enum.includes(value)) {
                    throw new Error(`Value must be one of: ${config.enum.join(', ')}`);
                  }
                converted = value;
                break;
            default:
                throw new Error(`Unsupported type: ${type}`);
    
            }
        return converted;
    }
    catch(error){
        throw new Error(`Invalid value for ${config.errorMessage || config.type}: ${value}`);
    }
}

export function logger(level:string,message:string,options:{logLevel:string}){
    if (options.logLevel === 'none') return;
    const levels: Record<'error' | 'warn' | 'info', number> = {
        error: 0,
        warn: 1,
        info: 2
      };
      if (level in levels && options.logLevel in levels) {
        if (levels[level as keyof typeof levels] <= levels[options.logLevel as keyof typeof levels]) {
          const prefix = `[env-validator] ${level.toUpperCase()}`;
          switch (level) {
            case 'error':
              console.error(prefix, message);
              break;
            case 'warn':
              console.warn(prefix, message);
              break;
            case 'info':
              console.info(prefix, message);
              break;
            default:
              console.log(prefix, message);
          }
        }
      }
}
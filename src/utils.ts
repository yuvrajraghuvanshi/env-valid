import { ValidationConfig } from "./types";


export function convertToType(value:string,config:ValidationConfig):any {
    const {type} = config;
    if(value === undefined||value === null|| value === ""){
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
                break;
            case 'boolean':
                converted = Boolean(value);
                break;
            case 'number':
                converted = Number(value);
                break;
            case 'array':
                converted = Array.isArray(value) ? value : (value.split(',').map(item=>convertToType(item,config.items)));
                break;
            case 'object':
                converted = typeof value === 'object' ? value : (JSON.parse(value));
                break;
            case 'enum':
                if(!config.enum.includes(value)){
                    throw new Error(`Invalid value for ${config.errorMessage || config.type}: ${value}`);
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
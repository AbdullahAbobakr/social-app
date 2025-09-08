import { ZodType, ZodError } from 'zod';
import type { Request ,Response ,NextFunction } from "express";
import { BadRequest } from '../utils/response/error.response';


type KeyReqType = keyof Request
type Schematype=Partial<Record<KeyReqType ,ZodType>>

export const validation=(schema:Schematype)=>{
  return (req:Request ,res:Response,next:NextFunction):NextFunction=>{
    const ValidationError:any [] = []
    for(const key of Object.keys(schema) as KeyReqType[]){
       if(!schema[key]) continue

       const validationResult = schema[key].safeParse(req[key])

       if(!validationResult.success){
        const errors = validationResult.error as ZodError
        ValidationError.push({
            key,
            issues:errors.issues.map((issue)=>{
                   return({message:issue.message ,path:issue.path[0]})
            })
        })
       }
    }

    if(ValidationError.length){
        throw new BadRequest("validation error",
            ValidationError
        )
    }
    return next() as unknown as NextFunction
  }
}
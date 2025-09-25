import { z ,ZodError ,ZodType} from 'zod';
import type { Request ,Response ,NextFunction } from "express";
import { BadRequest } from '../utils/response/error.response';


type KeyReqType = keyof Request
type Schematype=Partial<Record<KeyReqType ,ZodType>>

export const validation=(schema:Schematype)=>{
  return (req:Request ,res:Response,next:NextFunction):NextFunction=>{
    const ValidationError:any [] = []
    for(const key of Object.keys(schema) as KeyReqType[]){
       if(!schema[key]) continue
       if(req.file){
        req.body.attachements=[req.file]
       }
       if(req.files){
        req.body.attachements=req.files
       }

       const validationResult = schema[key].safeParse(req[key])

       if(!validationResult.success){
        const errors = validationResult.error as ZodError
        ValidationError.push({
            key,
            issues:errors.issues.map((issue)=>{
                   return({message:issue.message ,path:issue.path})
            })
        })
       }
    }

    if(ValidationError.length){
    console.log("❌ Validation Error Details:", JSON.stringify(ValidationError, null, 2));
    throw new BadRequest("validation error", ValidationError)
}

    return next() as unknown as NextFunction
  }
}

export const generateFields ={
  files:function(mimetype:string[]){
        return z.strictObject({
          fieldname:z.string(),
          originalname:z.string(),
          encoding:z.string(),
          mimetype:z.enum(mimetype),
          buffer:z.any().optional(),
          path:z.string().optional(),
          size:z.number()
      }).refine((data) => {
  return data.buffer || data.path
}, {
  message: "file is required",
  path: ["buffer", "path"]
})
}
}
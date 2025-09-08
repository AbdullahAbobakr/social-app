import {z} from 'zod'
import { logoutFlagEnum } from '../../utils/security/token.security';
import { Types } from 'mongoose';


export const logout ={
    body:z.strictObject({
        flag:z.enum(logoutFlagEnum).default(logoutFlagEnum.only)
    })
}

export const frezzeAccount ={
    params:z.object({
        userId:z.string().optional()
    }).optional().refine((data)=>{
       return data?.userId? Types.ObjectId .isValid(data.userId) : true
    },
    {
    error:"invalid objectId format",
    path:["userId"]
    }
),
}

export const restorsAccount = {
     params:z.object({
        userId:z.string()
     }).refine((data)=>{
        return Types.ObjectId .isValid(data.userId)
     },{
        error:"invalid objectId format",
        path:["userId"]
     })
}

export const hardDeleteAccount={
    params:z.object({
        userId:z.string()
    }).refine((data)=>{
      return Types.ObjectId .isValid(data.userId)
    },{
        error:"invalid objectId format ",
        path:["userId"]
    })
}
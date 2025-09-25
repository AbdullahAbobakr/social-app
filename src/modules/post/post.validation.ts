import { filevalidation } from './../../utils/multer/cloud.multer';
import { z} from "zod"
import { allowCommentsEnum, avaliableEnum, likePostEnum } from "../../DB/models/post.model"
import { generateFields } from '../../middleware/validation.middleware';
import { Types } from 'mongoose';


export const createPostValidation={
    body:z.strictObject({
        content:z.string().min(2).max(50000).optional(),
        attachements:z.array(generateFields.files(filevalidation.image)).max(2).optional(),
        
        allowComments:z.enum(allowCommentsEnum).default(allowCommentsEnum.allow),
        avaliable:z.enum(avaliableEnum).default(avaliableEnum.public),
        
        tags:z.array(z.string().refine(data=>{
            return Types.ObjectId.isValid(data)
        },{
            error:"invalid objectId format"
        })).max(2).optional(),
                
    })
    .superRefine((data,ctx)=>{
        if(!data.attachements?.length && !data.content){
            ctx.addIssue({
                code:"custom",
                path:["content"],
                message:"content or attachements is required"
            })
        }

        if(data.tags?.length && data.tags.length !== [...new Set(data.tags)].length){
           ctx.addIssue({
            code:"custom",
            path:["tags"],
            message:"dublicated tagged user"
           })
        }
    })


}

export const updatePostValidation={
    params:z.strictObject({
        postId:z.string()
    }),
    body:z.strictObject({
        content:z.string().min(2).max(50000).optional(),
        attachements:z.array(generateFields.files(filevalidation.image)).max(2).optional(),
        removeAttachements:z.array(z.string()).max(2).optional(),

        
        allowComments:z.enum(allowCommentsEnum).optional(),
        avaliable:z.enum(avaliableEnum).optional(),
        
        tags:z.array(z.string().refine(data=>{
            return Types.ObjectId.isValid(data)
        },{
            error:"invalid objectId format"
        })).max(2).optional(),

        removeTags:z.array(z.string().refine(data=>{
            return Types.ObjectId.isValid(data)
        },{
            error:"invalid objectId format"
        })).max(2).optional(),
                
    })
    .superRefine((data,ctx)=>{
        if(!Object.values(data)?.length){
            ctx.addIssue({
                code:"custom",
                path:["content"],
                message:"content or attachements is required"
            })
        }
        if(data.tags?.length && data.tags.length !== [...new Set(data.tags)].length){
           ctx.addIssue({
            code:"custom",
            path:["tags"],
            message:"dublicated tagged user"
           }) 
           
        }
        if(data.removeTags?.length && data.removeTags.length !== [...new Set(data.tags)].length){
           ctx.addIssue({
            code:"custom",
            path:["removeTags"],
            message:"dublicated tagged user"
           }) 
        }
    })
}

export const likePost ={
    params:z.strictObject({
        postId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid postId"),
    }),
    query:z.strictObject({
        action:z.enum(likePostEnum).default(likePostEnum.like)
    })
}
// export const fileTypes={
//     files:function(mimetype:string[]){
//       return z.strictObject({
//         fieldname:z.string(),
//         originalname:z.string(),
//         encoding:z.string(),
//         mimetype:z.enum(mimetype),
//         buffer:z.any().optional(),
//         path:z.string().optional(),
//         size:z.number()
//     }).refine((data)=>{
//         return data.buffer || data.path
//     },{
//         error:"file is required",
//         path:["buffer","path"]
//     })
//     }   
// }
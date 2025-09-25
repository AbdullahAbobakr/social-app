import { HydratedDocument, Schema, Types, model } from "mongoose";
import { Ipost } from "./post.model";


export interface IComment{
    content?:string,
    attachements?:string[],

    likes?:Types.ObjectId[],
    tags?:Types.ObjectId[],

    createdBy?:Types.ObjectId
    postId?:Types.ObjectId | Partial<Ipost>
    commentId?:Types.ObjectId

    frezzedAt?:Date,
    frezzedBy?:Types.ObjectId

    restoredAt?:Date,
    restoredBy?:Types.ObjectId
    friends?:Types.ObjectId[]

    createsAt?:Date,
    updatedAt?:Date,
}

 const commentSchema = new Schema<IComment>({
    content:{type:String, maxLength:500000, minLength:2 , required:function(){
        return !this.attachements?.length
    }},
    attachements:[String],

    likes:[{
        type:Schema.Types.ObjectId,
        ref:"user"
    }],
    tags:[{
        type:Schema.Types.ObjectId,
        ref:"user"
    }],

    createdBy:{
        type:Schema.Types.ObjectId,
        ref:"user",
    },
    postId:{
        type:Schema.Types.ObjectId,
        ref:"Post",
    },
    commentId:{
        type:Schema.Types.ObjectId,
        ref:"comment",
    },

    frezzedAt:Date,
    frezzedBy:{
        type:Schema.Types.ObjectId,
        ref:"user"
    },

    restoredAt:Date,
    restoredBy:{
        type:Schema.Types.ObjectId,
        ref:"user"
    },
    friends:{
        type:Schema.Types.ObjectId,
        ref:"user"
    },

    createsAt:Date,
    updatedAt:Date,
},{
    timestamps:true,
    strictQuery:true
})

commentSchema.pre(["find", "findOne" , "countDocuments"] , function(next){
    const query = this.getQuery()
    if (query.paranoid=false) {
        this.setQuery({...query})
    }else{
        this.setQuery({...query , freezedAt :{$exists:false}})
    }
    next()
})

commentSchema.pre(["findOneAndUpdate", "updateOne"] , function(next){
    const query = this.getQuery()
    if (query.paranoid=false) {
        this.setQuery({...query})
    }else{
        this.setQuery({...query , freezedAt :{$exists:false}})
    }
    next()
})


export type HCommentDocument = HydratedDocument<IComment>
export const commentModel = model<IComment>("comment",commentSchema)
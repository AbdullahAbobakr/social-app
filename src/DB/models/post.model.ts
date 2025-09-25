import { HydratedDocument, Schema, Types, model } from "mongoose";

export enum allowCommentsEnum{
    allow="allow",
    deny="deny"
}

export enum avaliableEnum{
    public="public",
    private="private",
    onlyMe="only-me",
    friends="friends"
}

export enum likePostEnum {
    like="like",
    unlike="unlike"
}

export interface Ipost{
    content?:string,
    attachements?:string[],

    assetFolderId?:string

    allowComments?:allowCommentsEnum,
    avaliable?:avaliableEnum,

    likes?:Types.ObjectId[],
    tags?:Types.ObjectId[],

    createdBy?:Types.ObjectId
    except?:Types.ObjectId[]
    only?:Types.ObjectId[]

    frezzedAt?:Date,
    frezzedBy?:Types.ObjectId

    restoredAt?:Date,
    restoredBy?:Types.ObjectId
    friends?:Types.ObjectId[]

    createsAt?:Date,
    updatedAt?:Date,
}

 const postSchema = new Schema<Ipost>({
    content:{type:String, maxLength:500000, minLength:2 , required:function(){
        return !this.attachements?.length
    }},
    attachements:[String],

    assetFolderId:{
         type:String,
    },

    allowComments:{
        type:String,
        enum:allowCommentsEnum,
        default:allowCommentsEnum.allow
    },

    avaliable:{
        type:String,
        enum:avaliableEnum,
        default:avaliableEnum.public
    },

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

    except:[{
        type:Schema.Types.ObjectId,
        ref:"user",
    }],
    only:{
        type:Schema.Types.ObjectId,
        ref:"user",
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

postSchema.pre(["find", "findOne" , "countDocuments"] , function(next){
    const query = this.getQuery()
    if (query.paranoid=false) {
        this.setQuery({...query})
    }else{
        this.setQuery({...query , freezedAt :{$exists:false}})
    }
    next()
})

postSchema.pre(["findOneAndUpdate", "updateOne"] , function(next){
    const query = this.getQuery()
    if (query.paranoid=false) {
        this.setQuery({...query})
    }else{
        this.setQuery({...query , freezedAt :{$exists:false}})
    }
    next()
})


export type HpostDocument = HydratedDocument<Ipost>
export const PostModel = model<Ipost>("post",postSchema)
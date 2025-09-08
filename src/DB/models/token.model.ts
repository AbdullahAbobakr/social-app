import mongoose from "mongoose";

export interface Itoken {
    jti:string,
    expiresIn:number,
    userId:mongoose.Schema.Types.ObjectId
}

const tokenSchema = new mongoose.Schema<Itoken>({
    jti:{
        type:String,
        required:true,
        unique:true,
    },
    expiresIn:{
        type:Number,
        required:true,
    },
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user",
        required:true,
    }
},{
    timestamps:true,
})

export const Tokenmodel = mongoose.model<Itoken>("token",tokenSchema)
export type HtokenDocument = mongoose.HydratedDocument<Itoken>
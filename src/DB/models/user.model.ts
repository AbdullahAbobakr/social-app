import mongoose, { Schema } from "mongoose";
import { Types } from "mongoose"

export enum GenderEnum {
    male = "male",
    female = "female"
}
export enum roleEnum {
    user = "user",
    admin = "admin"
}

export interface Iuser {
    _id: Types.ObjectId;

    profileImage?: string,
    coverImage?:string[],
    temProfileImage?:string,

    firstname: string,
    lastname: string,
    username?: string,

    email: string,
    confirmEmailotp?: string,
    confirmAt?: Date,

    password: string,
    resetpasswordotp?: string,
    changeCredentailsTime?: Date,

    phone?: string,
    address?: string,

    age: number,
    gender: GenderEnum,
    role: roleEnum,

    createdAt: Date,
    updatedAt?: Date,

    frezzedAt?:Date,
    frezzedBy?:Types.ObjectId,

    restoredAt?:Date,
    restoredBy?:string,


}

const userSchema = new mongoose.Schema<Iuser>({
    firstname: {
        type: String,
        trim: true,
        minLength: 2,
        maxLength: 25,
    },
    lastname: {
        type: String,
        trim: true,
        minLength: 2,
        maxLength: 25,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    confirmEmailotp: {
        type: String,
    },
    confirmAt: {
        type: Date,
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    resetpasswordotp: {
        type: String,
    },
    changeCredentailsTime: {
        type: Date,
    },
    age: {
        type: Number,
        min: 18,
        max: 70
    },
    gender: {
        type: String,
        enum: Object.values(GenderEnum),
        default: GenderEnum.male
    },
    phone: {
        type: String,
        trim: true,
    },
    createdAt: {
        type: Date,
    },
    updatedAt: {
        type: Date,
    },
    frezzedAt:{
        type:Date,
    },
    frezzedBy:{
       type: Schema.Types.ObjectId,
       ref:"user"    
    },

    restoredAt:{
        type:Date,
    },
    restoredBy:{
        type: Schema.Types.ObjectId, 
        ref:"user"    
    },
    profileImage:{
        type:String,
    },
    coverImage:{
        type:[String],
    },
    temProfileImage:{
        type:String
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})

export const UserModel = mongoose.model<Iuser>("user", userSchema)
export type HUserDocument = mongoose.HydratedDocument<Iuser>

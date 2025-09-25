import mongoose, { Schema, UpdateQuery } from "mongoose";
import { Types } from "mongoose"
import { TokenRepository  } from "../token.repository";
import { TokenModel } from "./token.model";
import { generateHash } from '../../utils/security/hash.security';
import { emailevent } from '../../utils/email/email.event';
import { nextTick } from "process";


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
    changeCredentialsTime: Date,

    phone?: string,
    address?: string,

    age: number,
    gender: GenderEnum,
    role: roleEnum,

    friends?: Types.ObjectId[];

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
    changeCredentialsTime: {
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
    strictQuery:true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})

userSchema.set("toObject", { virtuals: true });
userSchema.set("toJSON", { virtuals: true });

// userSchema.pre(["find" , "findOne"],function (next) {
//     const query = this.getQuery()
    
//     console.log("pre save =>",this,query,this.getOptions())

//     this.setOptions({lean:false})
//     if(query.paranoid===false){
//        this.setQuery({...query})
//     }else{
//         this.setQuery({...query,frezzeedAt:{$exists:false}})
//     }
//     next()
// })

// userSchema.post("save" , function(doc,next){
//     console.log("pre save",this)
//     next()
// })

// userSchema.pre("updateOne", function (next) {
//   const query = this.getQuery();
//   const update = this.getUpdate() as any;

//    if (update.frezzedAt || update?.$set?.frezzedAt) {
//     this.setUpdate({
//       ...update,
//     changeCredentialsTime:new Date(),
//     });
//   }

//   console.log("Final update:",query, this.getUpdate());

//   next();
// });


// userSchema.post("updateOne", async function (doc,next) {
//     const query = this.getQuery() 
//     const update=this.getUpdate() as UpdateQuery<HUserDocument>
     
//     console.log({query,update:update["$set"].changeCredentialsTime})
//     const tokenrepo = new TokenRepository(TokenModel);
//     if(update["$set"].changeCredentialsTime){
//         await tokenrepo.deletemany({filter:{
//             userId:query._id
//         }})
//     }
//     next()
// })

userSchema.pre("save",async function(this : HUserDocument &{wasNew:boolean , confirmEmailPlainOtp?:string},next){
       this.wasNew = this.isNew
       if(this.isModified("password")){
        this.password=await generateHash(this.password)
       }
       if(this.isModified("confirmEmailotp")){
        this.confirmEmailPlainOtp=this.confirmEmailotp as string
        this.confirmEmailotp=await generateHash(this.confirmEmailotp as string)
       }
       next()
})

userSchema.post("save",async function(doc,next){
    const that = this as  HUserDocument &{wasNew:boolean ; confirmEmailPlainOtp?:string}

    if( that.wasNew&& that.confirmEmailPlainOtp){
     emailevent.emit("confirmEmail", { to: this.email, otp: that.confirmEmailPlainOtp as string })
    }
    next()
})  

userSchema.pre(["find"], function (next) {
  const query = this.getQuery();

  if (query.paranoid === false) {
    this.setQuery({ ...query });
  } else {
    this.setQuery({
      ...query,
      freezedAt: { $exists: false } 
    });
  }

  next();
});


export const UserModel = mongoose.model<Iuser>("user", userSchema)
export type HUserDocument = mongoose.HydratedDocument<Iuser>

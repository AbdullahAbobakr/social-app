import { ForbiddenException } from "./../../utils/response/error.response";
import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt"
import { userRepository } from "../../DB/user.repository";
import { Iuser, roleEnum, UserModel } from "../../DB/models/user.model";
import { TokenRepository } from "../../DB/token.repository";
import { TokenModel } from "../../DB/models/token.model";
import { IfreezeAccountDto, IlogoutDto, IrestoreAccountDto ,IhardDeleteAccountDto} from "./user.dto";
import { logoutFlagEnum } from "../../utils/security/token.security";
import mongoose, { UpdateQuery } from "mongoose";
import {
  uploadlargefile,
  uploadfiles,
  createpresignedurl,
  deleteFiles,
} from "../../utils/multer/s3.config";
import { BadRequest } from "../../utils/response/error.response";
import { s3event } from "../../utils/multer/s3.event";

class userServices {
  private usermodel = new userRepository(UserModel);
  private tokenmodel = new TokenRepository(TokenModel);
  constructor() {}

  profile = async (req: Request, res: Response): Promise<Response> => {
    return res.json({
      message: "Done",
      data: {
        user: req.user?._id,
        decoded: req.decoded?._iat,
      },
    });
  };

  profileImage = async (req: Request, res: Response): Promise<Response> => {
    const key = await uploadlargefile({
      file: req.file as Express.Multer.File,
      path: `user/${req.decoded?._id}`,
    });
    return res.json({
      message: "Done",
      data: {
        key,
      },
    });
  };

  profilecoverImage = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    const urls = await uploadfiles({
      files: req.files as Express.Multer.File[],
      path: `user/${req.decoded?._id}/cover`,
    });

    const user = await this.usermodel.findByIdAndUpdate({
      id: req.user?._id as mongoose.Types.ObjectId,
      update: {
        coverImage: urls,
        new: true,
      },
    });

    if (!user) {
      throw new BadRequest("fail to update user cover image");
    }

    if (req.user?.coverImage) {
      await deleteFiles({ urls: req.user.coverImage });
    }

    return res.json({
      message: "Done",
      data: { urls },
    });
  };

  profileUrlImage = async (req: Request, res: Response): Promise<Response> => {
    const {
      ContentType,
      originalname,
    }: { ContentType: string; originalname: string } = req.body;
    const { url, Key } = await createpresignedurl({
      ContentType,
      originalname,
      path: `user/${req.user?._id}`,
    });
    const user = await this.usermodel.findByIdAndUpdate({
      id: req.user?._id as mongoose.Types.ObjectId,
      update: {
        profileImage: Key,
        temProfileImage: req.user?.profileImage,
      },
    });
    if (!user) {
      throw new BadRequest("fail to update user profile image");
    }
    s3event.emit("trackProfileImageUpload", {
      userId: req.user?._id as mongoose.Types.ObjectId,
      oldKey: req.user?.profileImage,
      Key,
      expiresIn: 30000,
    });
    return res.json({
      message: "Done",
      data: {
        url,
        Key,
      },
    });
  };

  updatePassword = async(req:Request,res:Response):Promise<Response>=>{
        const {oldPassword , newPassword} = req.body
        const user = await this.usermodel.findone({
          filter:{
            _id:req.user?._id,
          },
        })
        if(!user){
          throw new BadRequest("fail to update password")
        }
        const matchPasseord = await bcrypt.compare(oldPassword,user.password)
        if(!matchPasseord){
          throw new BadRequest("invalid old password")
        }
        const hashPassword = await bcrypt.hash(newPassword , 10)
        const updatePassword = await this.usermodel.updateone({
          filter:{
            _id:req.user?._id
          },
          update:{
            password:hashPassword
          }
        })
        return res.json({message:"Done",data:{updatePassword}})
  }

  updateBasicInfo=async(req:Request , res:Response):Promise<Response>=>{
    const {firstname , lastname , phone} = req.body
    const updatedBasicInfo = await this.usermodel.updateone({
      filter:{
        _id:req.user?._id
      },
      update:{
        firstname,
        lastname,
        phone
      }
    })
    if(!updatedBasicInfo){
      throw new BadRequest("fail to update basic info")
    }
    return res.json({message:"Done",data:{updatedBasicInfo}})
  }

  updateEmail = async(req:Request , res:Response):Promise<Response>=>{
    const {email} = req.body
    const updateEmail = await this.usermodel.updateone({
      filter:{
        _id:req.user?._id
      },
      update:{
        email,
      }
    })
    if(!updateEmail){
      throw new BadRequest("fail to update email")
    }
    return res.json({message:"Done",data:{updateEmail}})
  }

  freezeAccount = async (req: Request, res: Response): Promise<Response> => {
    const { userId } = (req.params as IfreezeAccountDto) || {};
    if (userId && req.user?.role !== roleEnum.admin) {
      throw new ForbiddenException("not authorized user");
    }
    const user = await this.usermodel.updateone({
      filter: {
        id: userId || req.user?._id,
        frezzedAt: { $exists: false },
      },
      update: {
        frezzedAt: new Date(),
        frezzedBy: req.user?._id,
        changeCredentailsTime: new Date(),
        $unset: {
          restoredAt: 1,
          restoredBy: 1,
        },
      },
    });
    if (!user.matchedCount) {
      throw new BadRequest("user not found or fail to update");
    }
    return res.json({ message: "done account freezed" });
  };

  restoreAccount = async (req: Request, res: Response):Promise<void> => {
    const { userId } = req.params as IrestoreAccountDto;
    const user = await this.usermodel.updateone({
      filter: {
        id: userId,
        frezzedBy: { $ne: userId },
      },
      update: {
        restoredAt: new Date(),
        restoredBy: req.user?._id,
        $unset: {
          frezzedAt: 1,
          frezzedBy: 1,
        },
      },
    });
    if (!user.matchedCount) {
      throw new BadRequest("user not found or fail to restore");
    }
  };

  hardDeleteAccount= async(req: Request, res: Response):Promise<void>=>{
    const {userId} =req.params as IhardDeleteAccountDto
    const user=await this.usermodel.deleteone({
      filter:{
         id:userId,
         frezzedAt:{$exists:true}
      }
    })
    if (!user.deletedCount) {
       throw new BadRequest("user not found or fail to hard delete");
    }
  }

  logout = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const { flag }: IlogoutDto = req.body;
    const update: UpdateQuery<Iuser> = {};
    switch (flag) {
      case logoutFlagEnum.all:
        update.changeCredentailsTime = new Date();
        break;
      default:
        await this.tokenmodel.create({
          data: [
            {
              jti: req.decoded?._jtia as string,
              expiresIn:
                (req.decoded?._iat as number) +
                Number(process.env.REFRESH_TOKEN_EXPIRE_TIME),
              userId: req.decoded?._id,
            },
          ],
        });
        break;
    }
    await this.usermodel.updateone({
      filter: { _id: req.decoded?._id },
      update: {},
    });
    return res.json({
      message: "logout done",
    });
  };
}

export default new userServices();

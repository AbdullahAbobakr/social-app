import { getFile ,deleteFile } from './s3.config';
import { userRepository } from '../../DB/user.repository';
import { UserModel } from '../../DB/models/user.model';
import {EventEmitter} from "node:events"

export const s3event = new EventEmitter

s3event.on("trackProfileImageUpload",(data)=>{
    console.log(data)
    setTimeout(async()=>{
        const userModel = new userRepository(UserModel)
        try {
            await getFile({Key:data.Key})
        await userModel.updateone({
            filter:{_id:data.userId},
            update:{
                profileImage:data.Key,
                $unset:{temProfileImage:1}
            }
        })
        await deleteFile({Key:data.oldKey})
        } catch (error:any) {
            console.log(error)
            if(error.Code === "NoSuchKey"){
                await userModel.updateone({
                    filter:{_id:data.userId},
                    update:{profileImage:data.Key,
                        $unset:{temProfileImage:1}
                    }
                })
            }
        }


    },data.expiresIn || Number(process.env.AWS_PRESIGNED_URL_EXPIRATION) * 1000)
})
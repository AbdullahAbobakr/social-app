import { Router } from "express";
import userServices from "./user.services";
import { authentication, authorization, } from "../../middleware/authentication.middleware";
import { clouduploadfile, filevalidation } from "../../utils/multer/cloud.multer";
import { storageEnum } from "../../utils/multer/cloud.multer";
import { validation } from "../../middleware/validation.middleware";
import * as validators from "./user.validation"
import { endpoint } from "./user.authorizations";
const userRouter = Router()


userRouter.get("/profile", authentication(), userServices.profile)
userRouter.post("/logout", authentication(), userServices.logout)

userRouter.patch("/update-password" , authentication(),userServices.updatePassword)
userRouter.get("/update-basic-info" , authentication(),userServices.updateBasicInfo)
userRouter.patch("/update-email" , authentication(),userServices.updateEmail)




userRouter.delete("{/:userId}/freeze-account",
    authentication(),
    validation(validators.frezzeAccount),
    userServices.freezeAccount
    )

    userRouter.patch("/:userId/restore-account",
        authorization(endpoint.restore),
        validation(validators.restorsAccount),
        userServices.restoreAccount
    )

    userRouter.delete("/:userId",
        authorization(endpoint.hardDelete),
        validation(validators.hardDeleteAccount),
        userServices.hardDeleteAccount
    )

userRouter.patch("/profile-image",
    clouduploadfile({
        validation: filevalidation.image,
        storageApproach: storageEnum.memory
    })
        .single("image")
    , userServices.profileImage)

userRouter.patch("/profilecoverimage",
    clouduploadfile({
        validation: filevalidation.image,
        storageApproach: storageEnum.disk
    })
        .array("image" , 2)
    , userServices.profilecoverImage)

userRouter.patch("/profileUrlImage",authentication(), userServices.profileUrlImage)
export default userRouter
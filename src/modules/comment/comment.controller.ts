import { Router } from "express";
import { authentication } from "../../middleware/authentication.middleware";
import { clouduploadfile, filevalidation } from "../../utils/multer/cloud.multer";
import * as validators from "./comment.validation"
import commentService from "./comment.services";
import { validation } from "../../middleware/validation.middleware";
const commentRouter = Router({mergeParams:true})

commentRouter.post("/", 
    authentication(),
clouduploadfile({validation:filevalidation.image}).array("attachments",2),
validation(validators.commentValidation),
commentService.createComment
)

commentRouter.post("/:commentId/reply", 
    authentication(),
clouduploadfile({validation:filevalidation.image}).array("attachments",2),
validation(validators.replyOnComment),
commentService.replyOnComment
)

export default commentRouter
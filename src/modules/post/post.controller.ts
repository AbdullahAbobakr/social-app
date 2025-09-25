import { Router } from "express";
import * as validators from "./post.validation"
import  {postService}  from "./post.services";
import { authentication } from "../../middleware/authentication.middleware";
import { clouduploadfile, filevalidation } from "../../utils/multer/cloud.multer";
import { validation } from "../../middleware/validation.middleware";
import commentRouter from "../comment/comment.controller";
const postRouter = Router()

postRouter.use("/:postId/comment" , commentRouter )

postRouter.post("/create",authentication(),
    clouduploadfile({validation:filevalidation.image}).array("attachments",2),
    validation(validators.createPostValidation)
    ,postService.createPost)

postRouter.patch("/:postId/like",
    authentication(),
    validation(validators.likePost),
    postService.LikePost
)    

postRouter.patch("/:postId/LikeAndUnlike",
    authentication(),
    validation(validators.likePost),
    postService.LikeAndUnlike
)  

export default postRouter
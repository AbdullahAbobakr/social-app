import type { Request, Response } from "express";
import { allowCommentsEnum, HpostDocument } from './../../DB/models/post.model';
import { commentModel } from "./../../DB/models/comment.model";
import { userRepository } from "../../DB/user.repository";
import { UserModel } from "../../DB/models/user.model";
import { PostRepository } from "../../DB/post.repository";
import { PostModel } from "../../DB/models/post.model";
import { CommentRepository } from "../../DB/comment.repository";
import { Types } from "mongoose";
import { postAvaliability } from '../post/post.services';
import {  BadRequest  } from '../../utils/response/error.response';
import {uploadfiles , deleteFiles} from "../../utils/multer/s3.config";

class commentService {
  private userModel = new userRepository(UserModel);
  private postModel = new PostRepository(PostModel);
  private commentModel = new CommentRepository(commentModel);

  constructor() {}

  createComment = async (req: Request, res: Response): Promise<Response> => {
    const {postId} = req.params as unknown as {postId:Types.ObjectId}
    const post = await this.postModel.findone({
        filter:{
            _id:postId,
            allowComments:allowCommentsEnum.allow,
            $or:postAvaliability(req)
        }
    })
    if(!post){
        throw new BadRequest("post not found")
    }
    if (
      req.body.tags?.length &&
      (await this.userModel.find({ filter: { _id: { $in: req.body.tags } } }))
        .length !== req.body.tags.length
    ) {
      throw new BadRequest("some mentioned user are not exist");
    }

    let attachements: string[] = [];
    if (req.files) {
      attachements = await uploadfiles({
        files: req.files as Express.Multer.File[],
        path: `users/${post.createdBy}/posts/${post.assetFolderId}`,
      });
    }

    const [comment] =
      (await this.commentModel.create({
        data: [
          {
            ...req.body,
            attachements,
            postId,
            createdBy: req.user?._id,
          },
        ],
      })) || [];
    if (!comment) {
      if (attachements.length) {
        await deleteFiles({
          urls: attachements,
        });
      }
      throw new BadRequest("post not created");
    }
    return res.json({ message: "post created", data: { comment } });
  };

  replyOnComment = async (req: Request, res: Response): Promise<Response> => {
    const {postId , commentId} = req.params as unknown as {postId:Types.ObjectId ; commentId:Types.ObjectId}
    const comment = await this.commentModel.findone({
        filter:{
            _id:commentId,
            postId,      
        },
        options:{
          populate:[{
               path:"postId",
               match:{
                 allowComments:allowCommentsEnum.allow,
                 $or:postAvaliability(req)
               }
          }]
        }
    })
    if(!comment?.postId){
        throw new BadRequest("post not found")
    }
    if (
      req.body.tags?.length &&
      (await this.userModel.find({ filter: { _id: { $in: req.body.tags } } }))
        .length !== req.body.tags.length
    ) {
      throw new BadRequest("some mentioned user are not exist");
    }

    let attachements: string[] = [];
    if (req.files) {
      const post = comment.postId as Partial<HpostDocument>
      attachements = await uploadfiles({
        files: req.files as Express.Multer.File[],
        path: `users/${post.createdBy}/posts/${post.assetFolderId}`,
      });
    }

    const [reply] =
      (await this.commentModel.create({
        data: [
          {
            ...req.body,
            attachements,
            postId,
            createdBy: req.user?._id,
          },
        ],
      })) || [];
    if (!reply) {
      if (attachements.length) {
        await deleteFiles({
          urls: attachements,
        });
      }
      throw new BadRequest("post not created");
    }
    return res.json({ message: "post created", data: { comment } });
  };
}

export default new commentService();

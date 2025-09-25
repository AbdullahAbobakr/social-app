import { Request, Response } from "express";
import { PostRepository } from "../../DB/post.repository";
import {
  avaliableEnum,
  HpostDocument,
  likePostEnum,
  PostModel,
} from "../../DB/models/post.model";
import { UserModel } from "../../DB/models/user.model";
import { userRepository } from "../../DB/user.repository";
import {
  BadRequest,
  NotfoundException,
} from "../../utils/response/error.response";
import { v4 as uuid } from "uuid";
import { deleteFiles, uploadfiles } from "../../utils/multer/s3.config";
import { IlikePostInputsDto } from "./post.dto";
import { Types, UpdateQuery } from "mongoose";

export const postAvaliability = (req: Request) => {
  return [
    { avaliable: avaliableEnum.public },
    { avaliable: avaliableEnum.onlyMe, createsBy: req.user?._id },
    {
      avaliable: avaliableEnum.friends,
      createdBy: { $in: [...(req.user?.friends || []), req.user?._id] },
    },
    {
      avaliable: { $ne: avaliableEnum.onlyMe },
      tags: { $in: req.user?._id },
    },
  ];
};

class postServices {
  private usermodel = new userRepository(UserModel);
  private postmodel = new PostRepository(PostModel);
  constructor() {}
  createPost = async (req: Request, res: Response) => {
    if (
      req.body.tags?.length &&
      (await this.usermodel.find({ filter: { _id: { $in: req.body.tags } } }))
        .length !== req.body.tags.length
    ) {
      throw new BadRequest("some mentioned user are not exist");
    }

    let attachements: string[] = [];
    let assetFolderId: string = uuid();
    if (req.files) {
      attachements = await uploadfiles({
        files: req.files as Express.Multer.File[],
        path: `users/${req.user?._id}/posts/${assetFolderId}`,
      });
    }

    const [post] =
      (await this.postmodel.create({
        data: [
          {
            ...req.body,
            attachements,
            assetFolderId,
            createdBy: req.user?._id,
          },
        ],
      })) || [];
    if (!post) {
      if (attachements.length) {
        await deleteFiles({
          urls: attachements,
        });
      }
      throw new BadRequest("post not created");
    }

    return res.json({ message: "post created", data: { post } });
  };

  updatePost = async (req: Request, res: Response) => {
    const { postId } = req.params as unknown as { postId: string };
    const post = await this.postmodel.findone({
      filter: {
        _id: postId,
        createdBy: req.user?._id,
      },
    });
    if (!post) {
      throw new NotfoundException("fail to find the post");
    }

    if (
      req.body.tags?.length &&
      (await this.usermodel.find({ filter: { _id: { $in: req.body.tags } } }))
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

    const updatePost = await this.postmodel.updateone({
      filter: { _id: postId },
      update: [
        {
          $set: {
            content: req.body.content,
            allowComments: req.body.allowComments || post.allowComments,
            avaliable: req.body.avaliable || post.avaliable,
            attachements: {
              $setUnion: [
                {
                  $setDifference: [
                    "$attachements",
                    req.body.removeAttachements,
                  ],
                },
              ],
            },

            tags: {
              $setUnion: [
                {
                  $setDifference: [
                    "$tags",
                    (req.body.removeTags || []).map((tag: string) => {
                      return Types.ObjectId.createFromHexString(tag);
                    }),
                  ],
                },
                (req.body.removeTags || []).map((tag: string) => {
                  return Types.ObjectId.createFromHexString(tag);
                }),
              ],
            },
          },
        },
      ],
    });

    if (!updatePost.matchedCount) {
      if (attachements.length) {
        await deleteFiles({
          urls: attachements,
        });
      }
      throw new BadRequest("post not created");
    }

    return res.json({ message: "post created", data: { post } });
  };

  LikePost = async (req: Request, res: Response) => {
    const { postId } = req.params as { postId: string };
    const { action } = req.query as IlikePostInputsDto;
    let update: UpdateQuery<HpostDocument> = {
      $addToSet: { lokes: req.user?._id },
    };
    if (action === likePostEnum.like) {
      update = { $pull: { likes: req.user?._id } };
    }
    const post = this.postmodel.findOneAndUpdate({
      filter: { _id: postId, $or: postAvaliability(req) },
      update,
    });
    if (!post) {
      throw new NotfoundException("invalid postId or post not exists ");
    }
    res.json({ message: "Done" });
  };

  LikeAndUnlike = async (req: Request, res: Response): Promise<Response> => {
    const { postId } = req.params;

    const post = await this.postmodel.findone({ filter: { _id: postId } });
    if (!post) throw new BadRequest("post not found");

    const alreadyLiked = post.likes.includes(req.user?._id);
    let updated;

    if (alreadyLiked) {
      updated = await this.postmodel.updateone({
        filter: { _id: postId },
        update: { $pull: { likes: req.user?._id } }
      });
    } else {
      updated = await this.postmodel.updateone({
        filter: { _id: postId },
        update: { $push: { likes: req.user?._id } }
      });
    }

    return res.json({
      message: alreadyLiked ? "unliked" : "liked",
      data: { likes: updated.like }
    });
  };
}

export const postService = new postServices();

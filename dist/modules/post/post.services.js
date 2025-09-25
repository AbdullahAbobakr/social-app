"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postService = exports.postAvaliability = void 0;
const post_repository_1 = require("../../DB/post.repository");
const post_model_1 = require("../../DB/models/post.model");
const user_model_1 = require("../../DB/models/user.model");
const user_repository_1 = require("../../DB/user.repository");
const error_response_1 = require("../../utils/response/error.response");
const uuid_1 = require("uuid");
const s3_config_1 = require("../../utils/multer/s3.config");
const mongoose_1 = require("mongoose");
const postAvaliability = (req) => {
    return [
        { avaliable: post_model_1.avaliableEnum.public },
        { avaliable: post_model_1.avaliableEnum.onlyMe, createsBy: req.user?._id },
        {
            avaliable: post_model_1.avaliableEnum.friends,
            createdBy: { $in: [...(req.user?.friends || []), req.user?._id] },
        },
        {
            avaliable: { $ne: post_model_1.avaliableEnum.onlyMe },
            tags: { $in: req.user?._id },
        },
    ];
};
exports.postAvaliability = postAvaliability;
class postServices {
    usermodel = new user_repository_1.userRepository(user_model_1.UserModel);
    postmodel = new post_repository_1.PostRepository(post_model_1.PostModel);
    constructor() { }
    createPost = async (req, res) => {
        if (req.body.tags?.length &&
            (await this.usermodel.find({ filter: { _id: { $in: req.body.tags } } }))
                .length !== req.body.tags.length) {
            throw new error_response_1.BadRequest("some mentioned user are not exist");
        }
        let attachements = [];
        let assetFolderId = (0, uuid_1.v4)();
        if (req.files) {
            attachements = await (0, s3_config_1.uploadfiles)({
                files: req.files,
                path: `users/${req.user?._id}/posts/${assetFolderId}`,
            });
        }
        const [post] = (await this.postmodel.create({
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
                await (0, s3_config_1.deleteFiles)({
                    urls: attachements,
                });
            }
            throw new error_response_1.BadRequest("post not created");
        }
        return res.json({ message: "post created", data: { post } });
    };
    updatePost = async (req, res) => {
        const { postId } = req.params;
        const post = await this.postmodel.findone({
            filter: {
                _id: postId,
                createdBy: req.user?._id,
            },
        });
        if (!post) {
            throw new error_response_1.NotfoundException("fail to find the post");
        }
        if (req.body.tags?.length &&
            (await this.usermodel.find({ filter: { _id: { $in: req.body.tags } } }))
                .length !== req.body.tags.length) {
            throw new error_response_1.BadRequest("some mentioned user are not exist");
        }
        let attachements = [];
        if (req.files) {
            attachements = await (0, s3_config_1.uploadfiles)({
                files: req.files,
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
                                        (req.body.removeTags || []).map((tag) => {
                                            return mongoose_1.Types.ObjectId.createFromHexString(tag);
                                        }),
                                    ],
                                },
                                (req.body.removeTags || []).map((tag) => {
                                    return mongoose_1.Types.ObjectId.createFromHexString(tag);
                                }),
                            ],
                        },
                    },
                },
            ],
        });
        if (!updatePost.matchedCount) {
            if (attachements.length) {
                await (0, s3_config_1.deleteFiles)({
                    urls: attachements,
                });
            }
            throw new error_response_1.BadRequest("post not created");
        }
        return res.json({ message: "post created", data: { post } });
    };
    LikePost = async (req, res) => {
        const { postId } = req.params;
        const { action } = req.query;
        let update = {
            $addToSet: { lokes: req.user?._id },
        };
        if (action === post_model_1.likePostEnum.like) {
            update = { $pull: { likes: req.user?._id } };
        }
        const post = this.postmodel.findOneAndUpdate({
            filter: { _id: postId, $or: (0, exports.postAvaliability)(req) },
            update,
        });
        if (!post) {
            throw new error_response_1.NotfoundException("invalid postId or post not exists ");
        }
        res.json({ message: "Done" });
    };
    LikeAndUnlike = async (req, res) => {
        const { postId } = req.params;
        const post = await this.postmodel.findone({ filter: { _id: postId } });
        if (!post)
            throw new error_response_1.BadRequest("post not found");
        const alreadyLiked = post.likes.includes(req.user?._id);
        let updated;
        if (alreadyLiked) {
            updated = await this.postmodel.updateone({
                filter: { _id: postId },
                update: { $pull: { likes: req.user?._id } }
            });
        }
        else {
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
exports.postService = new postServices();

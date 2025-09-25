"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const post_model_1 = require("./../../DB/models/post.model");
const comment_model_1 = require("./../../DB/models/comment.model");
const user_repository_1 = require("../../DB/user.repository");
const user_model_1 = require("../../DB/models/user.model");
const post_repository_1 = require("../../DB/post.repository");
const post_model_2 = require("../../DB/models/post.model");
const comment_repository_1 = require("../../DB/comment.repository");
const post_services_1 = require("../post/post.services");
const error_response_1 = require("../../utils/response/error.response");
const s3_config_1 = require("../../utils/multer/s3.config");
class commentService {
    userModel = new user_repository_1.userRepository(user_model_1.UserModel);
    postModel = new post_repository_1.PostRepository(post_model_2.PostModel);
    commentModel = new comment_repository_1.CommentRepository(comment_model_1.commentModel);
    constructor() { }
    createComment = async (req, res) => {
        const { postId } = req.params;
        const post = await this.postModel.findone({
            filter: {
                _id: postId,
                allowComments: post_model_1.allowCommentsEnum.allow,
                $or: (0, post_services_1.postAvaliability)(req)
            }
        });
        if (!post) {
            throw new error_response_1.BadRequest("post not found");
        }
        if (req.body.tags?.length &&
            (await this.userModel.find({ filter: { _id: { $in: req.body.tags } } }))
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
        const [comment] = (await this.commentModel.create({
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
                await (0, s3_config_1.deleteFiles)({
                    urls: attachements,
                });
            }
            throw new error_response_1.BadRequest("post not created");
        }
        return res.json({ message: "post created", data: { comment } });
    };
    replyOnComment = async (req, res) => {
        const { postId, commentId } = req.params;
        const comment = await this.commentModel.findone({
            filter: {
                _id: commentId,
                postId,
            },
            options: {
                populate: [{
                        path: "postId",
                        match: {
                            allowComments: post_model_1.allowCommentsEnum.allow,
                            $or: (0, post_services_1.postAvaliability)(req)
                        }
                    }]
            }
        });
        if (!comment?.postId) {
            throw new error_response_1.BadRequest("post not found");
        }
        if (req.body.tags?.length &&
            (await this.userModel.find({ filter: { _id: { $in: req.body.tags } } }))
                .length !== req.body.tags.length) {
            throw new error_response_1.BadRequest("some mentioned user are not exist");
        }
        let attachements = [];
        if (req.files) {
            const post = comment.postId;
            attachements = await (0, s3_config_1.uploadfiles)({
                files: req.files,
                path: `users/${post.createdBy}/posts/${post.assetFolderId}`,
            });
        }
        const [reply] = (await this.commentModel.create({
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
                await (0, s3_config_1.deleteFiles)({
                    urls: attachements,
                });
            }
            throw new error_response_1.BadRequest("post not created");
        }
        return res.json({ message: "post created", data: { comment } });
    };
}
exports.default = new commentService();

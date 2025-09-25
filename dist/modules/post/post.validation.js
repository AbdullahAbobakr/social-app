"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.likePost = exports.updatePostValidation = exports.createPostValidation = void 0;
const cloud_multer_1 = require("./../../utils/multer/cloud.multer");
const zod_1 = require("zod");
const post_model_1 = require("../../DB/models/post.model");
const validation_middleware_1 = require("../../middleware/validation.middleware");
const mongoose_1 = require("mongoose");
exports.createPostValidation = {
    body: zod_1.z.strictObject({
        content: zod_1.z.string().min(2).max(50000).optional(),
        attachements: zod_1.z.array(validation_middleware_1.generateFields.files(cloud_multer_1.filevalidation.image)).max(2).optional(),
        allowComments: zod_1.z.enum(post_model_1.allowCommentsEnum).default(post_model_1.allowCommentsEnum.allow),
        avaliable: zod_1.z.enum(post_model_1.avaliableEnum).default(post_model_1.avaliableEnum.public),
        tags: zod_1.z.array(zod_1.z.string().refine(data => {
            return mongoose_1.Types.ObjectId.isValid(data);
        }, {
            error: "invalid objectId format"
        })).max(2).optional(),
    })
        .superRefine((data, ctx) => {
        if (!data.attachements?.length && !data.content) {
            ctx.addIssue({
                code: "custom",
                path: ["content"],
                message: "content or attachements is required"
            });
        }
        if (data.tags?.length && data.tags.length !== [...new Set(data.tags)].length) {
            ctx.addIssue({
                code: "custom",
                path: ["tags"],
                message: "dublicated tagged user"
            });
        }
    })
};
exports.updatePostValidation = {
    params: zod_1.z.strictObject({
        postId: zod_1.z.string()
    }),
    body: zod_1.z.strictObject({
        content: zod_1.z.string().min(2).max(50000).optional(),
        attachements: zod_1.z.array(validation_middleware_1.generateFields.files(cloud_multer_1.filevalidation.image)).max(2).optional(),
        removeAttachements: zod_1.z.array(zod_1.z.string()).max(2).optional(),
        allowComments: zod_1.z.enum(post_model_1.allowCommentsEnum).optional(),
        avaliable: zod_1.z.enum(post_model_1.avaliableEnum).optional(),
        tags: zod_1.z.array(zod_1.z.string().refine(data => {
            return mongoose_1.Types.ObjectId.isValid(data);
        }, {
            error: "invalid objectId format"
        })).max(2).optional(),
        removeTags: zod_1.z.array(zod_1.z.string().refine(data => {
            return mongoose_1.Types.ObjectId.isValid(data);
        }, {
            error: "invalid objectId format"
        })).max(2).optional(),
    })
        .superRefine((data, ctx) => {
        if (!Object.values(data)?.length) {
            ctx.addIssue({
                code: "custom",
                path: ["content"],
                message: "content or attachements is required"
            });
        }
        if (data.tags?.length && data.tags.length !== [...new Set(data.tags)].length) {
            ctx.addIssue({
                code: "custom",
                path: ["tags"],
                message: "dublicated tagged user"
            });
        }
        if (data.removeTags?.length && data.removeTags.length !== [...new Set(data.tags)].length) {
            ctx.addIssue({
                code: "custom",
                path: ["removeTags"],
                message: "dublicated tagged user"
            });
        }
    })
};
exports.likePost = {
    params: zod_1.z.strictObject({
        postId: zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid postId"),
    }),
    query: zod_1.z.strictObject({
        action: zod_1.z.enum(post_model_1.likePostEnum).default(post_model_1.likePostEnum.like)
    })
};

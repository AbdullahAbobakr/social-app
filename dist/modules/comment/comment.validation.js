"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.replyOnComment = exports.commentValidation = void 0;
const cloud_multer_1 = require("./../../utils/multer/cloud.multer");
const zod_1 = require("zod");
const validation_middleware_1 = require("../../middleware/validation.middleware");
const mongoose_1 = require("mongoose");
exports.commentValidation = {
    params: zod_1.z.strictObject({
        postId: zod_1.z.string(),
    }),
    body: zod_1.z
        .object({
        content: zod_1.z.string().min(2).max(50000).optional(),
        attachments: zod_1.z
            .array(validation_middleware_1.generateFields.files(cloud_multer_1.filevalidation.image))
            .max(2)
            .optional(),
        tags: zod_1.z
            .array(zod_1.z.string().refine((data) => {
            return mongoose_1.Types.ObjectId.isValid(data);
        }, {
            message: "invalid objectId format",
        }))
            .max(2)
            .optional(),
    })
        .superRefine((data, ctx) => {
        if (!data.attachments?.length && !data.content) {
            ctx.addIssue({
                code: "custom",
                path: ["content"],
                message: "content or attachments is required",
            });
        }
        if (data.tags?.length &&
            data.tags.length !== [...new Set(data.tags)].length) {
            ctx.addIssue({
                code: "custom",
                path: ["tags"],
                message: "duplicated tagged user",
            });
        }
    })
        .superRefine((data, ctx) => {
        if (!data.attachments?.length && !data.content) {
            ctx.addIssue({
                code: "custom",
                path: ["content"],
                message: "content or attachements is required",
            });
        }
        if (data.tags?.length &&
            data.tags.length !== [...new Set(data.tags)].length) {
            ctx.addIssue({
                code: "custom",
                path: ["tags"],
                message: "dublicated tagged user",
            });
        }
    }),
};
exports.replyOnComment = {
    params: zod_1.z.strictObject({
        commentId: zod_1.z.string()
    }),
    body: exports.commentValidation.body
};

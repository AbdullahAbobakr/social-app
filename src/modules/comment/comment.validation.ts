import { filevalidation } from "./../../utils/multer/cloud.multer";
import { z } from "zod";
import { generateFields } from "../../middleware/validation.middleware";
import { Types } from "mongoose";

export const commentValidation = {
  params: z.strictObject({
    postId: z.string(),
  }),
  body: z
    .object({
      content: z.string().min(2).max(50000).optional(),
      attachments: z
        .array(generateFields.files(filevalidation.image))
        .max(2)
        .optional(),
      tags: z
        .array(
          z.string().refine(
            (data) => {
              return Types.ObjectId.isValid(data);
            },
            {
              message: "invalid objectId format",
            }
          )
        )
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
      if (
        data.tags?.length &&
        data.tags.length !== [...new Set(data.tags)].length
      ) {
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
      if (
        data.tags?.length &&
        data.tags.length !== [...new Set(data.tags)].length
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["tags"],
          message: "dublicated tagged user",
        });
      }
    }),
};

export const replyOnComment ={
    params:z.strictObject({
        commentId:z.string()
    }),

    body:commentValidation.body
}

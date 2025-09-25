"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateFields = exports.validation = void 0;
const zod_1 = require("zod");
const error_response_1 = require("../utils/response/error.response");
const validation = (schema) => {
    return (req, res, next) => {
        const ValidationError = [];
        for (const key of Object.keys(schema)) {
            if (!schema[key])
                continue;
            if (req.file) {
                req.body.attachements = [req.file];
            }
            if (req.files) {
                req.body.attachements = req.files;
            }
            const validationResult = schema[key].safeParse(req[key]);
            if (!validationResult.success) {
                const errors = validationResult.error;
                ValidationError.push({
                    key,
                    issues: errors.issues.map((issue) => {
                        return ({ message: issue.message, path: issue.path });
                    })
                });
            }
        }
        if (ValidationError.length) {
            console.log("❌ Validation Error Details:", JSON.stringify(ValidationError, null, 2));
            throw new error_response_1.BadRequest("validation error", ValidationError);
        }
        return next();
    };
};
exports.validation = validation;
exports.generateFields = {
    files: function (mimetype) {
        return zod_1.z.strictObject({
            fieldname: zod_1.z.string(),
            originalname: zod_1.z.string(),
            encoding: zod_1.z.string(),
            mimetype: zod_1.z.enum(mimetype),
            buffer: zod_1.z.any().optional(),
            path: zod_1.z.string().optional(),
            size: zod_1.z.number()
        }).refine((data) => {
            return data.buffer || data.path;
        }, {
            message: "file is required",
            path: ["buffer", "path"]
        });
    }
};

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validation = void 0;
const error_response_1 = require("../utils/response/error.response");
const validation = (schema) => {
    return (req, res, next) => {
        const ValidationError = [];
        for (const key of Object.keys(schema)) {
            if (!schema[key])
                continue;
            const validationResult = schema[key].safeParse(req[key]);
            if (!validationResult.success) {
                const errors = validationResult.error;
                ValidationError.push({
                    key,
                    issues: errors.issues.map((issue) => {
                        return ({ message: issue.message, path: issue.path[0] });
                    })
                });
            }
        }
        if (ValidationError.length) {
            throw new error_response_1.BadRequest("validation error", ValidationError);
        }
        return next();
    };
};
exports.validation = validation;

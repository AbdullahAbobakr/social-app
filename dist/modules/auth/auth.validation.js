"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.confirmEmail = exports.signup = exports.login = void 0;
const zod_1 = require("zod");
exports.login = {
    body: zod_1.z.object({
        email: zod_1.z.string().email("Invalid email format"),
        password: zod_1.z.string().min(6, "Password must be at least 6 characters"),
    }),
};
exports.signup = {
    body: exports.login.body
        .extend({
        username: zod_1.z.string().min(2, "Username too short").max(30, "Username too long"),
        confirmPassword: zod_1.z.string(),
    })
        .superRefine((data, ctx) => {
        if (data.confirmPassword !== data.password) {
            ctx.addIssue({
                code: "custom",
                path: ["confirmPassword"],
                message: "Password and Confirm Password must match",
            });
        }
        if (data.username.trim().split(" ").length !== 2) {
            ctx.addIssue({
                code: "custom",
                path: ["username"],
                message: "Username must consist of two parts (e.g. first & last name)",
            });
        }
    }),
};
exports.confirmEmail = {
    body: zod_1.z.strictObject({
        email: zod_1.z.string().email("Invalid email format"),
        otp: zod_1.z.number(),
    }),
};

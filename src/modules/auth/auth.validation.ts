import { z } from "zod";

export const login = {
  body: z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters"),
  }),
};

export const signup = {
  body: login.body
    .extend({
      username: z.string().min(2, "Username too short").max(30, "Username too long"),
      confirmPassword: z.string(),
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

export const confirmEmail = {
  body: z.strictObject({
    email: z.string().email("Invalid email format"),
    otp: z.number(),
  }),
};

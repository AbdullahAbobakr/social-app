import {z}from "zod"
import { likePost } from "./post.validation"

export type IlikePostInputsDto = z.infer< typeof likePost.query>
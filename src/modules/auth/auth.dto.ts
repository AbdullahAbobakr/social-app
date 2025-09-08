import { login } from './auth.validation';
// export interface IsignupBodyInputsDto {
//     username:string,
//     email:string,
//     password:string
// }
import * as validators from "./auth.validation"
import {z} from "zod"

export type IsignupBodyInputsDto = z.infer<typeof validators.signup.body>
export type IconfirmEmailBodyInputsDto = z.infer<typeof validators.confirmEmail.body>
export type IloginBodyInputsDto = z.infer<typeof validators.login.body>


import {Router} from "express"
import authServices from "./auth.services"
import * as validators from "./auth.validation"
import { validation } from "../../middleware/validation.middleware"
const authRouter = Router()

authRouter.post("/signup" ,validation(validators.signup), authServices.signup ) 
authRouter.post("/confirmEmail" ,validation(validators.confirmEmail), authServices.confirmEmail ) 
authRouter.post("/login" ,validation(validators.login), authServices.login ) 

export default authRouter
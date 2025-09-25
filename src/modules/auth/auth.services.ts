import type { Request, Response } from "express"
import { IsignupBodyInputsDto, IconfirmEmailBodyInputsDto,IloginBodyInputsDto } from "./auth.dto"
import {UserModel} from "../../DB/models/user.model"
import { userRepository } from "../../DB/user.repository";
import { compareHash } from "../../utils/security/hash.security";
import { generateNmuberOtp } from '../../utils/otp';
import { NotfoundException } from '../../utils/response/error.response';
import { createlogincredentials } from '../../utils/security/token.security';

class authenticationServices {
   private userModel = new userRepository(UserModel)
   constructor() { }

   signup = async (req: Request, res: Response): Promise<Response> => {
      const { username, email, password }: IsignupBodyInputsDto = req.body
      
      const otp = generateNmuberOtp()
      const user = (await this.userModel.createuser({
         data: [{
            username, email, password,
            confirmEmailotp:`${otp}`
         }],
      })) || []
      return res.status(201).json({ message: "done", data: { user } })

   }

   confirmEmail = async (req: Request, res: Response): Promise<Response> => {
      const { email, otp }: IconfirmEmailBodyInputsDto = req.body
      const user = await this.userModel.findone({
         filter: {
            email,
            confirmEmailotp: { $exists: true },
            confirmAt: { $exists: false }
         }
      })
      
      if (!user) {
         throw new NotfoundException("invalid account")
      }
      if (!(await compareHash(String(otp), user.confirmEmailotp as string))) {
         throw new NotfoundException("invalid code otp");
      }

      await this.userModel.updateone({
         filter: { email },
         update: {
            confirmAt: new Date(),
            unset: { confirmEmailotp: "", }
         },

      })

      return res.json({ message: "done", data: req.body })
   }
   
   login = async (req: Request, res: Response): Promise<Response> => {
      const {email ,password}:IloginBodyInputsDto=req.body
      const user = await this.userModel.findone({
         filter:{email},
      })
      if(!user){
         throw new NotfoundException("invalid account")
      }
      if(!user.confirmAt){
         throw new NotfoundException("please confirm your email")
      }
      if(!(await compareHash(password,user.password as string))){
         throw new NotfoundException("invalid account")
      }
      
      const credentials= await createlogincredentials(user)

      return res.json({ message: "done", data: {credentials} })
   }
}
export default new authenticationServices()
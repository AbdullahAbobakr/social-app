import { NextFunction, Request, Response } from "express"
import { BadRequest, ForbiddenException } from "../utils/response/error.response"
import { decodeToken, Tokenenum } from "../utils/security/token.security"
import { roleEnum } from "../DB/models/user.model"


export const authentication= ( tokenType:Tokenenum = Tokenenum.access)=>{
    return async (req:Request,res:Response,next:NextFunction)=>{
        if(!req.headers.authorization){
            throw new BadRequest("invalide authorization",{
                key:"headers",
                issues:[{path:["authorization"],message:"invalide authorization"}]
            })
        }
        const {decoded,user}= await decodeToken({
            authorization:req.headers.authorization as string,
            tokenType,
        })
        req.user=user
        req.decoded=decoded

        next()
}}

export const authorization= (accessrole:roleEnum[]=[],tokenType:Tokenenum = Tokenenum.access)=>{
    return async (req:Request,res:Response,next:NextFunction)=>{
        if(!req.headers.authorization){
            throw new BadRequest("invalide authorization",{
                key:"headers",
                issues:[{path:["authorization"],message:"invalide authorization"}]
            })
        }
        const {decoded,user}= await decodeToken({
            authorization:req.headers.authorization as string,
            tokenType,
        })
        if(!accessrole.includes(user.role)){
            throw new ForbiddenException("not authorized account")
        }
        req.user=user
        req.decoded=decoded

        next()
}}
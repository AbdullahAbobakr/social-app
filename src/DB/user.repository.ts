import { CreateOptions, HydratedDocument, Model } from "mongoose";
import { databaseRepository } from "./database.repository";
import { Iuser } from "./models/user.model";
import { BadRequest } from "../utils/response/error.response";


export class userRepository extends databaseRepository<Iuser> {
    constructor(protected override readonly model:Model<Iuser>){
    super(model)
}

async createuser({
    data,
    options,
}:{
    data:Partial<Iuser>[],
    options?:CreateOptions
}):Promise<HydratedDocument<Iuser>>{

   const [user]= (await this.create({data,options})) || []
   if (!user) {
    throw new BadRequest("fail to create")
   }
   return user
}
}
import { Itoken, TokenModel } from './models/token.model';
import { databaseRepository } from "./database.repository";
import { Model } from 'mongoose';



export class TokenRepository extends databaseRepository<Itoken>{
    constructor(protected override readonly model:Model<Itoken>){
        super(model)
    }
}

export const tokenRepository = new TokenRepository(TokenModel);
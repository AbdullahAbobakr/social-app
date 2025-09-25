import { IComment, commentModel } from './models/comment.model';
import { databaseRepository } from "./database.repository";
import { Model } from 'mongoose';



export class CommentRepository extends databaseRepository<IComment>{
    constructor(protected override readonly model:Model<IComment>){
        super(model)
    }
}
export const tokenRepository = new CommentRepository(commentModel);
import { Ipost } from './models/post.model';
import { databaseRepository } from "./database.repository";
import { Model } from 'mongoose';


export class PostRepository extends databaseRepository<Ipost>{
    constructor(protected override readonly model:Model<Ipost>){
        super(model)
    }
}
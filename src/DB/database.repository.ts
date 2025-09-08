import mongoose, {
  CreateOptions,
  DeleteResult,
  HydratedDocument,
  Model,
  MongooseUpdateQueryOptions,
  ProjectionType,
  QueryOptions,
  RootFilterQuery,
  UpdateQuery,
  UpdateWriteOpResult,
} from "mongoose";

export class databaseRepository<Tdocument> {
  constructor(protected readonly model: Model<Tdocument>) {}

  async findone({
    filter,
    select,
  }: {
    filter: RootFilterQuery<Tdocument>;
    select?: ProjectionType<Tdocument>;
    options?: QueryOptions<Tdocument>;
  }): Promise<HydratedDocument<Tdocument> | null> {
    return await this.model.findOne(filter).select("");
  }

  async create({
    data,
    options,
  }: {
    data: Partial<Tdocument>[];
    options?: CreateOptions | undefined;
  }): Promise<HydratedDocument<Tdocument>[] | undefined> {
    return await this.model.create(data, options);
  }

  async updateone({
    filter,
    update,
    options,
  }: {
    filter: RootFilterQuery<Tdocument>;
    update: UpdateQuery<Tdocument>;
    options?: MongooseUpdateQueryOptions<Tdocument> | null;
  }): Promise<UpdateWriteOpResult> {
    return this.model.updateOne(
      filter,
      { ...update, $inc: { __v: 1 } },
      options
    );
  }

  async deleteone({
    filter,
  }: {
    filter: RootFilterQuery<Tdocument>;
  }): Promise<DeleteResult> {
    return this.model.deleteOne(filter);
  }

  async findByIdAndUpdate({
    id,
    update,
    options,
  }: {
    id: string | mongoose.Types.ObjectId;
    update: UpdateQuery<Tdocument>;
    options?: MongooseUpdateQueryOptions<Tdocument>;
  }): Promise<HydratedDocument<Tdocument> | null> {
    return this.model.findByIdAndUpdate(id, update, options);
  }
}

import mongoose, {
  CreateOptions,
  DeleteResult,
  HydratedDocument,
  Model,
  MongooseUpdateQueryOptions,
  PopulateOptions,
  ProjectionType,
  QueryOptions,
  RootFilterQuery,
  UpdateQuery,
  UpdateWriteOpResult,
} from "mongoose";

export class databaseRepository<Tdocument> {
  constructor(protected readonly model: Model<Tdocument>) {}

  async find({
    filter,
    select,
    options,
  }: {
    filter: RootFilterQuery<Tdocument>;
    select?: ProjectionType<Tdocument>;
    options?: QueryOptions<Tdocument>;
  }): Promise<HydratedDocument<Tdocument>[] | []> {
    const doc = this.model.find(filter || {}).select(select || "");
    if (options?.populate) {
      doc.populate(options.populate as PopulateOptions[]);
    }
    if (options?.limit) {
      doc.limit(options.limit);
    }
    if (options?.skip) {
      doc.skip(options.skip);
    }
    return await doc;
  }

  async paginate({
    filter = {},
    select = {},
    options = {},
    page = "all",
    size = 5,
  }: {
    filter: RootFilterQuery<Tdocument>;
    select?: ProjectionType<Tdocument> | undefined;
    options?: QueryOptions<Tdocument> | undefined;
    page?: number | "all";
    size?: number;
  }): Promise<HydratedDocument<Tdocument>[] | [] | any> {
    let docsCount: number | undefined = undefined;
    let pages: number | undefined = undefined;
    if (page !== "all") {
      page = Math.floor(page < 1 ? 1 : page);
      options.limit = Math.floor(size < 1 || !size ? 5 : size);
      options.skip = (page - 1) * options.limit;

      docsCount = await this.model.countDocuments(filter);
      pages = Math.ceil(docsCount / options?.limit);
    }
    const reault = await this.find({ filter, select, options });

    return {
      docsCount,
      limit: options.limit,
      pages,
      currentPage: page !== "all" ? page : undefined,
      reault,
    };
  }

  async findone({
    filter,
    select,
    options,
  }: {
    filter: RootFilterQuery<Tdocument>;
    select?: ProjectionType<Tdocument>;
    options?: QueryOptions<Tdocument>;
  }): Promise<HydratedDocument<Tdocument> | null> {
    const doc = this.model.findOne(filter).select(select || "");
    if (options?.populate) {
      doc.populate(options.populate as PopulateOptions[]);
    }
    return await doc;
  }

  async findById({
    id,
    select,
    options,
  }: {
    id: mongoose.Types.ObjectId;
    select?: ProjectionType<Tdocument>;
    options?: QueryOptions<Tdocument>;
  }): Promise<HydratedDocument<Tdocument> | null> {
    return await this.model.findById(id).select(select || "");
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

  async findOneAndUpdate({
    filter,
    update,
    options,
  }: {
    filter?: RootFilterQuery<Tdocument>;
    update: UpdateQuery<Tdocument>;
    options?: MongooseUpdateQueryOptions<Tdocument>;
  }): Promise<HydratedDocument<Tdocument> | null> {
    return this.model.findOneAndUpdate(
      filter,
      { ...update, $inc: { __v: 1 } },
      options
    );
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

  async insertMany({
    data,
  }: {
    data: Partial<Tdocument>[];
  }): Promise<HydratedDocument<Tdocument>[]> {
    return (await this.model.insertMany(data)) as HydratedDocument<Tdocument>[];
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
    if (Array.isArray(update)) {
      update.push({
        $set: {
          __v: { $inc: 1 },
        },
      });
      return this.model.updateOne(filter || {}, update, options);
    }
    return this.model.updateOne(
      filter || {},
      { ...update, $inc: { __v: 1 } },
      options
    );
  }

  async findOneAndDelete({
    filter,
  }: {
    filter: RootFilterQuery<Tdocument>;
  }): Promise<HydratedDocument<Tdocument> | null> {
    return this.model.findOneAndDelete(filter);
  }

  async deleteone({
    filter,
  }: {
    filter: RootFilterQuery<Tdocument>;
  }): Promise<DeleteResult> {
    return this.model.deleteOne(filter);
  }

  async deletemany({
    filter,
  }: {
    filter: RootFilterQuery<Tdocument>;
  }): Promise<DeleteResult> {
    return this.model.deleteMany(filter);
  }
}

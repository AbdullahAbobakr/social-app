"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.databaseRepository = void 0;
class databaseRepository {
    model;
    constructor(model) {
        this.model = model;
    }
    async find({ filter, select, options, }) {
        const doc = this.model.find(filter || {}).select(select || "");
        if (options?.populate) {
            doc.populate(options.populate);
        }
        if (options?.limit) {
            doc.limit(options.limit);
        }
        if (options?.skip) {
            doc.skip(options.skip);
        }
        return await doc;
    }
    async paginate({ filter = {}, select = {}, options = {}, page = "all", size = 5, }) {
        let docsCount = undefined;
        let pages = undefined;
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
    async findone({ filter, select, options, }) {
        const doc = this.model.findOne(filter).select(select || "");
        if (options?.populate) {
            doc.populate(options.populate);
        }
        return await doc;
    }
    async findById({ id, select, options, }) {
        return await this.model.findById(id).select(select || "");
    }
    async findByIdAndUpdate({ id, update, options, }) {
        return this.model.findByIdAndUpdate(id, update, options);
    }
    async findOneAndUpdate({ filter, update, options, }) {
        return this.model.findOneAndUpdate(filter, { ...update, $inc: { __v: 1 } }, options);
    }
    async create({ data, options, }) {
        return await this.model.create(data, options);
    }
    async insertMany({ data, }) {
        return (await this.model.insertMany(data));
    }
    async updateone({ filter, update, options, }) {
        if (Array.isArray(update)) {
            update.push({
                $set: {
                    __v: { $inc: 1 },
                },
            });
            return this.model.updateOne(filter || {}, update, options);
        }
        return this.model.updateOne(filter || {}, { ...update, $inc: { __v: 1 } }, options);
    }
    async findOneAndDelete({ filter, }) {
        return this.model.findOneAndDelete(filter);
    }
    async deleteone({ filter, }) {
        return this.model.deleteOne(filter);
    }
    async deletemany({ filter, }) {
        return this.model.deleteMany(filter);
    }
}
exports.databaseRepository = databaseRepository;

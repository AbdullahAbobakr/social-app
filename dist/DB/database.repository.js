"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.databaseRepository = void 0;
class databaseRepository {
    model;
    constructor(model) {
        this.model = model;
    }
    async findone({ filter, select, }) {
        return await this.model.findOne(filter).select("");
    }
    async create({ data, options, }) {
        return await this.model.create(data, options);
    }
    async updateone({ filter, update, options, }) {
        return this.model.updateOne(filter, { ...update, $inc: { __v: 1 } }, options);
    }
    async deleteone({ filter, }) {
        return this.model.deleteOne(filter);
    }
    async findByIdAndUpdate({ id, update, options, }) {
        return this.model.findByIdAndUpdate(id, update, options);
    }
}
exports.databaseRepository = databaseRepository;

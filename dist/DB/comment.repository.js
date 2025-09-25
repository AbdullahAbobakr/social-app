"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tokenRepository = exports.CommentRepository = void 0;
const comment_model_1 = require("./models/comment.model");
const database_repository_1 = require("./database.repository");
class CommentRepository extends database_repository_1.databaseRepository {
    model;
    constructor(model) {
        super(model);
        this.model = model;
    }
}
exports.CommentRepository = CommentRepository;
exports.tokenRepository = new CommentRepository(comment_model_1.commentModel);

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tokenRepository = exports.TokenRepository = void 0;
const token_model_1 = require("./models/token.model");
const database_repository_1 = require("./database.repository");
class TokenRepository extends database_repository_1.databaseRepository {
    model;
    constructor(model) {
        super(model);
        this.model = model;
    }
}
exports.TokenRepository = TokenRepository;
exports.tokenRepository = new TokenRepository(token_model_1.TokenModel);

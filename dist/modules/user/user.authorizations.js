"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.endpoint = void 0;
const user_model_1 = require("../../DB/models/user.model");
exports.endpoint = {
    profile: [user_model_1.roleEnum.user, user_model_1.roleEnum.admin],
    restore: [user_model_1.roleEnum.admin],
    hardDelete: [user_model_1.roleEnum.admin]
};

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorization = exports.authentication = void 0;
const error_response_1 = require("../utils/response/error.response");
const token_security_1 = require("../utils/security/token.security");
const authentication = (tokenType = token_security_1.Tokenenum.access) => {
    return async (req, res, next) => {
        if (!req.headers.authorization) {
            throw new error_response_1.BadRequest("invalide authorization", {
                key: "headers",
                issues: [{ path: ["authorization"], message: "invalide authorization" }]
            });
        }
        const { decoded, user } = await (0, token_security_1.decodeToken)({
            authorization: req.headers.authorization,
            tokenType,
        });
        req.user = user;
        req.decoded = decoded;
        console.log(tokenType);
        next();
    };
};
exports.authentication = authentication;
const authorization = (accessrole = [], tokenType = token_security_1.Tokenenum.access) => {
    return async (req, res, next) => {
        if (!req.headers.authorization) {
            throw new error_response_1.BadRequest("invalide authorization", {
                key: "headers",
                issues: [{ path: ["authorization"], message: "invalide authorization" }]
            });
        }
        const { decoded, user } = await (0, token_security_1.decodeToken)({
            authorization: req.headers.authorization,
            tokenType,
        });
        if (!accessrole.includes(user.role)) {
            throw new error_response_1.ForbiddenException("not authorized account");
        }
        req.user = user;
        req.decoded = decoded;
        next();
    };
};
exports.authorization = authorization;

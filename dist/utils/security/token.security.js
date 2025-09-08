"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeToken = exports.createlogincredentials = exports.getSignatures = exports.detectSigntureLevel = exports.verifytoken = exports.generatrtoken = exports.logoutFlagEnum = exports.Tokenenum = exports.signtureLevelEnum = void 0;
const user_model_1 = require("./../../DB/models/user.model");
const jsonwebtoken_1 = require("jsonwebtoken");
const error_response_1 = require("../..//utils/response/error.response");
const user_repository_1 = require("../../DB/user.repository");
const uuid_1 = require("uuid");
const token_repository_1 = require("../../DB/token.repository");
const token_model_1 = require("../../DB/models/token.model");
var signtureLevelEnum;
(function (signtureLevelEnum) {
    signtureLevelEnum["Brearer"] = "Brearer";
    signtureLevelEnum["System"] = "System";
})(signtureLevelEnum || (exports.signtureLevelEnum = signtureLevelEnum = {}));
var Tokenenum;
(function (Tokenenum) {
    Tokenenum["access"] = "access";
    Tokenenum["refresh"] = "refresh";
})(Tokenenum || (exports.Tokenenum = Tokenenum = {}));
var logoutFlagEnum;
(function (logoutFlagEnum) {
    logoutFlagEnum["only"] = "only";
    logoutFlagEnum["all"] = "all";
})(logoutFlagEnum || (exports.logoutFlagEnum = logoutFlagEnum = {}));
const generatrtoken = async ({ payload, secret = process.env.ACCESS_USER_TOKEN_SIGNATURE, options = { expiresIn: process.env.ACCESS_TOKEN_EXPIRE_TIME || "1h" }, }) => {
    return (0, jsonwebtoken_1.sign)(payload, secret, options);
};
exports.generatrtoken = generatrtoken;
const verifytoken = async ({ token, secret = process.env.ACCESS_USER_TOKEN_SIGNATURE, }) => {
    const decoded = (0, jsonwebtoken_1.verify)(token, secret);
    if (typeof decoded === "string") {
        throw new error_response_1.BadRequest("invalid token payload");
    }
    return decoded;
};
exports.verifytoken = verifytoken;
const detectSigntureLevel = async (role = user_model_1.roleEnum.user) => {
    let signtureLevel = signtureLevelEnum.Brearer;
    switch (role) {
        case user_model_1.roleEnum.admin:
            signtureLevel = signtureLevelEnum.System;
            break;
        default:
            signtureLevel = signtureLevelEnum.Brearer;
            break;
    }
    return signtureLevel;
};
exports.detectSigntureLevel = detectSigntureLevel;
const getSignatures = async (signtureLevel = signtureLevelEnum.Brearer) => {
    let signtures = {
        access_signature: "",
        refresh_signature: ""
    };
    switch (signtureLevel) {
        case signtureLevelEnum.System:
            signtures.access_signature = process.env.ACCESS_SYSTREM_TOKEN_SIGNATURE;
            signtures.refresh_signature = process.env.REFRESH_SYSTREM_TOKEN_SIGNATURE;
            break;
        default:
            signtures.access_signature = process.env.ACCESS_USER_TOKEN_SIGNATURE;
            signtures.refresh_signature = process.env.REFRESH_USER_TOKEN_SIGNATURE;
            break;
    }
    return signtures;
};
exports.getSignatures = getSignatures;
const createlogincredentials = async (user) => {
    const signtureLevel = await (0, exports.detectSigntureLevel)(user.role);
    const signatures = await (0, exports.getSignatures)(signtureLevel);
    const jwtid = (0, uuid_1.v4)();
    const accessToken = await (0, exports.generatrtoken)({
        payload: { id: user._id },
        secret: signatures.access_signature,
        options: { expiresIn: process.env.ACCESS_TOKEN_EXPIRE_TIME || "1h", jwtid }
    });
    const refreshToken = await (0, exports.generatrtoken)({
        payload: { id: user._id },
        secret: signatures.refresh_signature,
        options: { expiresIn: process.env.REFRESH_TOKEN_EXPIRE_TIME || "7d", jwtid }
    });
    return { accessToken, refreshToken };
};
exports.createlogincredentials = createlogincredentials;
const decodeToken = async ({ authorization, tokenType = Tokenenum.access }) => {
    const userModel = new user_repository_1.userRepository(user_model_1.UserModel);
    const tokenmodel = new token_repository_1.TokenRepository(token_model_1.Tokenmodel);
    const [bearerKey, token] = authorization.split(" ");
    if (!bearerKey || !token) {
        throw new error_response_1.unauthorizationException("invalid token");
    }
    const signatures = await (0, exports.getSignatures)(bearerKey);
    const decoded = await (0, exports.verifytoken)({
        token,
        secret: tokenType === Tokenenum.refresh
            ? signatures.refresh_signature
            : signatures.access_signature
    });
    if (!decoded?.id) {
        throw new error_response_1.BadRequest("invalid token payload");
    }
    if (await tokenmodel.findone({
        filter: { jti: decoded?.jti }
    })) {
        throw new error_response_1.unauthorizationException("invalid token");
    }
    const user = await userModel.findone({ filter: { _id: decoded.id } });
    if (!user) {
        throw new error_response_1.BadRequest("no user for this token");
    }
    if ((user.changeCredentailsTime?.getTime() || 0) > (decoded.iat * 1000)) {
        throw new error_response_1.unauthorizationException("invalid token");
    }
    return { decoded, user };
};
exports.decodeToken = decodeToken;

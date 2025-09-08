"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const error_response_1 = require("./../../utils/response/error.response");
const user_repository_1 = require("../../DB/user.repository");
const user_model_1 = require("../../DB/models/user.model");
const token_repository_1 = require("../../DB/token.repository");
const token_model_1 = require("../../DB/models/token.model");
const token_security_1 = require("../../utils/security/token.security");
const s3_config_1 = require("../../utils/multer/s3.config");
const error_response_2 = require("../../utils/response/error.response");
const s3_event_1 = require("../../utils/multer/s3.event");
class userServices {
    usermodel = new user_repository_1.userRepository(user_model_1.UserModel);
    tokenmodel = new token_repository_1.TokenRepository(token_model_1.Tokenmodel);
    constructor() { }
    profile = async (req, res) => {
        return res.json({
            message: "Done",
            data: {
                user: req.user?._id,
                decoded: req.decoded?._iat,
            },
        });
    };
    profileImage = async (req, res) => {
        const key = await (0, s3_config_1.uploadlargefile)({
            file: req.file,
            path: `user/${req.decoded?._id}`,
        });
        return res.json({
            message: "Done",
            data: {
                key,
            },
        });
    };
    profilecoverImage = async (req, res) => {
        const urls = await (0, s3_config_1.uploadfiles)({
            files: req.files,
            path: `user/${req.decoded?._id}/cover`,
        });
        const user = await this.usermodel.findByIdAndUpdate({
            id: req.user?._id,
            update: {
                coverImage: urls,
                new: true,
            },
        });
        if (!user) {
            throw new error_response_2.BadRequest("fail to update user cover image");
        }
        if (req.user?.coverImage) {
            await (0, s3_config_1.deleteFiles)({ urls: req.user.coverImage });
        }
        return res.json({
            message: "Done",
            data: { urls },
        });
    };
    profileUrlImage = async (req, res) => {
        const { ContentType, originalname, } = req.body;
        const { url, Key } = await (0, s3_config_1.createpresignedurl)({
            ContentType,
            originalname,
            path: `user/${req.user?._id}`,
        });
        const user = await this.usermodel.findByIdAndUpdate({
            id: req.user?._id,
            update: {
                profileImage: Key,
                temProfileImage: req.user?.profileImage,
            },
        });
        if (!user) {
            throw new error_response_2.BadRequest("fail to update user profile image");
        }
        s3_event_1.s3event.emit("trackProfileImageUpload", {
            userId: req.user?._id,
            oldKey: req.user?.profileImage,
            Key,
            expiresIn: 30000,
        });
        return res.json({
            message: "Done",
            data: {
                url,
                Key,
            },
        });
    };
    freezeAccount = async (req, res) => {
        const { userId } = req.params || {};
        if (userId && req.user?.role !== user_model_1.roleEnum.admin) {
            throw new error_response_1.ForbiddenException("not authorized user");
        }
        const user = await this.usermodel.updateone({
            filter: {
                id: userId || req.user?._id,
                frezzedAt: { $exists: false },
            },
            update: {
                frezzedAt: new Date(),
                frezzedBy: req.user?._id,
                changeCredentailsTime: new Date(),
                $unset: {
                    restoredAt: 1,
                    restoredBy: 1,
                },
            },
        });
        if (!user.matchedCount) {
            throw new error_response_2.BadRequest("user not found or fail to update");
        }
        return res.json({ message: "done account freezed" });
    };
    restoreAccount = async (req, res) => {
        const { userId } = req.params;
        const user = await this.usermodel.updateone({
            filter: {
                id: userId,
                frezzedBy: { $ne: userId },
            },
            update: {
                restoredAt: new Date(),
                restoredBy: req.user?._id,
                $unset: {
                    frezzedAt: 1,
                    frezzedBy: 1,
                },
            },
        });
        if (!user.matchedCount) {
            throw new error_response_2.BadRequest("user not found or fail to restore");
        }
    };
    hardDeleteAccount = async (req, res) => {
        const { userId } = req.params;
        const user = await this.usermodel.deleteone({
            filter: {
                id: userId,
                frezzedAt: { $exists: true }
            }
        });
        if (!user.deletedCount) {
            throw new error_response_2.BadRequest("user not found or fail to hard delete");
        }
    };
    logout = async (req, res, next) => {
        const { flag } = req.body;
        const update = {};
        switch (flag) {
            case token_security_1.logoutFlagEnum.all:
                update.changeCredentailsTime = new Date();
                break;
            default:
                await this.tokenmodel.create({
                    data: [
                        {
                            jti: req.decoded?._jtia,
                            expiresIn: req.decoded?._iat +
                                Number(process.env.REFRESH_TOKEN_EXPIRE_TIME),
                            userId: req.decoded?._id,
                        },
                    ],
                });
                break;
        }
        await this.usermodel.updateone({
            filter: { _id: req.decoded?._id },
            update: {},
        });
        return res.json({
            message: "logout done",
        });
    };
}
exports.default = new userServices();

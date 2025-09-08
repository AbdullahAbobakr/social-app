"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.s3event = void 0;
const s3_config_1 = require("./s3.config");
const user_repository_1 = require("../../DB/user.repository");
const user_model_1 = require("../../DB/models/user.model");
const node_events_1 = require("node:events");
exports.s3event = new node_events_1.EventEmitter;
exports.s3event.on("trackProfileImageUpload", (data) => {
    console.log(data);
    setTimeout(async () => {
        const userModel = new user_repository_1.userRepository(user_model_1.UserModel);
        try {
            await (0, s3_config_1.getFile)({ Key: data.Key });
            await userModel.updateone({
                filter: { _id: data.userId },
                update: {
                    profileImage: data.Key,
                    $unset: { temProfileImage: 1 }
                }
            });
            await (0, s3_config_1.deleteFile)({ Key: data.oldKey });
        }
        catch (error) {
            console.log(error);
            if (error.Code === "NoSuchKey") {
                await userModel.updateone({
                    filter: { _id: data.userId },
                    update: { profileImage: data.Key,
                        $unset: { temProfileImage: 1 }
                    }
                });
            }
        }
    }, data.expiresIn || Number(process.env.AWS_PRESIGNED_URL_EXPIRATION) * 1000);
});

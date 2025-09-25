"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostModel = exports.likePostEnum = exports.avaliableEnum = exports.allowCommentsEnum = void 0;
const mongoose_1 = require("mongoose");
var allowCommentsEnum;
(function (allowCommentsEnum) {
    allowCommentsEnum["allow"] = "allow";
    allowCommentsEnum["deny"] = "deny";
})(allowCommentsEnum || (exports.allowCommentsEnum = allowCommentsEnum = {}));
var avaliableEnum;
(function (avaliableEnum) {
    avaliableEnum["public"] = "public";
    avaliableEnum["private"] = "private";
    avaliableEnum["onlyMe"] = "only-me";
    avaliableEnum["friends"] = "friends";
})(avaliableEnum || (exports.avaliableEnum = avaliableEnum = {}));
var likePostEnum;
(function (likePostEnum) {
    likePostEnum["like"] = "like";
    likePostEnum["unlike"] = "unlike";
})(likePostEnum || (exports.likePostEnum = likePostEnum = {}));
const postSchema = new mongoose_1.Schema({
    content: { type: String, maxLength: 500000, minLength: 2, required: function () {
            return !this.attachements?.length;
        } },
    attachements: [String],
    assetFolderId: {
        type: String,
    },
    allowComments: {
        type: String,
        enum: allowCommentsEnum,
        default: allowCommentsEnum.allow
    },
    avaliable: {
        type: String,
        enum: avaliableEnum,
        default: avaliableEnum.public
    },
    likes: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "user"
        }],
    tags: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "user"
        }],
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "user",
    },
    except: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "user",
        }],
    only: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "user",
    },
    frezzedAt: Date,
    frezzedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "user"
    },
    restoredAt: Date,
    restoredBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "user"
    },
    friends: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "user"
    },
    createsAt: Date,
    updatedAt: Date,
}, {
    timestamps: true,
    strictQuery: true
});
postSchema.pre(["find", "findOne", "countDocuments"], function (next) {
    const query = this.getQuery();
    if (query.paranoid = false) {
        this.setQuery({ ...query });
    }
    else {
        this.setQuery({ ...query, freezedAt: { $exists: false } });
    }
    next();
});
postSchema.pre(["findOneAndUpdate", "updateOne"], function (next) {
    const query = this.getQuery();
    if (query.paranoid = false) {
        this.setQuery({ ...query });
    }
    else {
        this.setQuery({ ...query, freezedAt: { $exists: false } });
    }
    next();
});
exports.PostModel = (0, mongoose_1.model)("post", postSchema);

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commentModel = void 0;
const mongoose_1 = require("mongoose");
const commentSchema = new mongoose_1.Schema({
    content: { type: String, maxLength: 500000, minLength: 2, required: function () {
            return !this.attachements?.length;
        } },
    attachements: [String],
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
    postId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Post",
    },
    commentId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "comment",
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
commentSchema.pre(["find", "findOne", "countDocuments"], function (next) {
    const query = this.getQuery();
    if (query.paranoid = false) {
        this.setQuery({ ...query });
    }
    else {
        this.setQuery({ ...query, freezedAt: { $exists: false } });
    }
    next();
});
commentSchema.pre(["findOneAndUpdate", "updateOne"], function (next) {
    const query = this.getQuery();
    if (query.paranoid = false) {
        this.setQuery({ ...query });
    }
    else {
        this.setQuery({ ...query, freezedAt: { $exists: false } });
    }
    next();
});
exports.commentModel = (0, mongoose_1.model)("comment", commentSchema);

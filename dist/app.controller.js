"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const auth_controller_1 = __importDefault(require("./modules/auth/auth.controller"));
const user_controller_1 = __importDefault(require("./modules/user/user.controller"));
const post_controller_1 = __importDefault(require("./modules/post/post.controller"));
const connection_DB_1 = require("./DB/connection.DB");
const error_response_1 = require("./utils/response/error.response");
const node_path_1 = __importDefault(require("node:path"));
const dotenv = __importStar(require("dotenv"));
const node_util_1 = require("node:util");
const node_stream_1 = require("node:stream");
const s3_config_1 = require("./utils/multer/s3.config");
const socket_io_1 = require("socket.io");
const writePipeLine = (0, node_util_1.promisify)(node_stream_1.pipeline);
dotenv.config({ path: node_path_1.default.join("src", "config", ".env.development") });
const bootstrap = async () => {
    await (0, connection_DB_1.connectDB)();
    const port = process.env.PORT || 5000;
    const app = (0, express_1.default)();
    app.use((0, cors_1.default)(), express_1.default.json());
    app.get("/", (req, res) => {
        res.json({ message: "welcome" });
    });
    app.use("/", auth_controller_1.default);
    app.use("/", user_controller_1.default);
    app.use("/", post_controller_1.default);
    app.get("/delete", async (req, res) => {
        const { key } = req.query;
        const result = await (0, s3_config_1.deleteFile)({ Key: key });
        return res.json({ massage: "Done Delete", data: { result } });
    });
    app.get("/delete-files", async (req, res) => {
        const result = await (0, s3_config_1.deleteFiles)({ urls: [],
            Quiet: true });
        return res.json({ massage: "Done Delete", data: { result } });
    });
    app.get("/delete-list", async (req, res) => {
        const result = await (0, s3_config_1.ListDirectoryFiles)({});
        if (!result?.Contents?.length) {
            throw new error_response_1.BadRequest("empty");
        }
        const urls = result.Contents.map((file) => {
            return file.Key;
        });
        await (0, s3_config_1.deleteFiles)({ urls });
        return res.json({ massage: "Done Delete", data: { urls } });
    });
    app.get("/upload/signed/*path", async (req, res) => {
        const { path } = req.params;
        if (!path?.length) {
            throw new error_response_1.BadRequest("invalid path", {
                validationerror: {
                    Key: "params",
                    issues: [{ path: "path", message: "invalid path" }],
                },
            });
        }
        const Key = path.join("/");
        const signedUrl = await (0, s3_config_1.createGetPreSignedUrl)({ Key });
        return res.json({ signedUrl });
    });
    app.get("/upload/*path", async (req, res) => {
        const { path } = req.params;
        if (!path?.length) {
            throw new error_response_1.BadRequest("invalid path", {
                validationerror: {
                    Key: "params",
                    issues: [{ path: "path", message: "invalid path" }],
                },
            });
        }
        const s3Response = await (0, s3_config_1.getFile)({ Key: path.join("/") });
        if (!s3Response?.Body) {
            throw new error_response_1.BadRequest("fail to fetch this resource");
        }
        res.setHeader("Content-Type", s3Response.ContentType || "application/octet-stream");
        await writePipeLine(s3Response.Body, res);
    });
    app.use(error_response_1.globelErrorhandling);
    const httpServer = app.listen(port, () => {
        console.log(`server is running on port ${process.env.PORT}`);
    });
    const io = new socket_io_1.Server(httpServer);
};
exports.default = bootstrap;

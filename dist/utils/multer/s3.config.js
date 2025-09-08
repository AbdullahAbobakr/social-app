"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListDirectoryFiles = exports.deleteFiles = exports.deleteFile = exports.createGetPreSignedUrl = exports.getFile = exports.createpresignedurl = exports.uploadlargefile = exports.uploadlargefiles = exports.uploadfiles = exports.uploadfile = exports.s3config = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const cloud_multer_1 = require("./cloud.multer");
const uuid_1 = require("uuid");
const fs_1 = require("fs");
const error_response_1 = require("../response/error.response");
const lib_storage_1 = require("@aws-sdk/lib-storage");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const s3config = () => {
    return new client_s3_1.S3Client({
        region: process.env.AWS_REGION,
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
    });
};
exports.s3config = s3config;
const uploadfile = async ({ storageApproach = cloud_multer_1.storageEnum.memory, Bucket = process.env.AWS_BUCKET_NAME, ACL = "private", path = "general", file, }) => {
    const command = new client_s3_1.PutObjectCommand({
        Bucket,
        ACL,
        Key: `${path}/${(0, uuid_1.v4)()}/${file.originalname}`,
        Body: storageApproach === cloud_multer_1.storageEnum.memory
            ? file.buffer
            : (0, fs_1.createReadStream)(file.path),
        ContentType: file.mimetype,
    });
    await (0, exports.s3config)().send(command);
    if (!command?.input?.Key) {
        throw new error_response_1.NotfoundException("fail to upload file");
    }
    return command.input.Key;
};
exports.uploadfile = uploadfile;
const uploadfiles = async ({ storageApproach = cloud_multer_1.storageEnum.memory, Bucket = process.env.AWS_BUCKET_NAME, ACL = "private", path = "general", files, }) => {
    let urls = [];
    urls = await Promise.all(files.map(file => {
        return (0, exports.uploadfile)({
            storageApproach,
            Bucket,
            ACL,
            path,
            file
        });
    }));
    return urls;
};
exports.uploadfiles = uploadfiles;
const uploadlargefiles = async ({ storageApproach = cloud_multer_1.storageEnum.memory, Bucket = process.env.AWS_BUCKET_NAME, ACL = "private", path = "general", files, }) => {
    let urls = [];
    urls = await Promise.all(files.map(file => {
        return (0, exports.uploadlargefile)({
            storageApproach,
            Bucket,
            ACL,
            path,
            file
        });
    }));
    return urls;
};
exports.uploadlargefiles = uploadlargefiles;
const uploadlargefile = async ({ storageApproach = cloud_multer_1.storageEnum.memory, Bucket = process.env.AWS_BUCKET_NAME, ACL = "private", path = "general", file, }) => {
    const upload = new lib_storage_1.Upload({
        client: (0, exports.s3config)(),
        params: {
            Bucket,
            ACL,
            Key: `${path}/${(0, uuid_1.v4)()}/${file.originalname}`,
            Body: storageApproach === cloud_multer_1.storageEnum.memory
                ? file.buffer
                : (0, fs_1.createReadStream)(file.path),
            ContentType: file.mimetype,
        },
    });
    upload.on("httpUploadProgress", (progress) => {
        console.log(progress);
    });
    const { Key } = await upload.done();
    if (!Key) {
        throw new error_response_1.NotfoundException("fail to upload file");
    }
    return Key;
};
exports.uploadlargefile = uploadlargefile;
const createpresignedurl = async ({ Bucket = process.env.AWS_BUCKET_NAME, path = "general", expiresIn = 120, originalname, ContentType, }) => {
    const comand = new client_s3_1.PutObjectCommand({
        Bucket,
        Key: `${path}/${(0, uuid_1.v4)()}/${originalname}`,
        ContentType,
    });
    const url = await (0, s3_request_presigner_1.getSignedUrl)((0, exports.s3config)(), comand, { expiresIn });
    if (!url || !comand?.input?.Key) {
        throw new error_response_1.BadRequest("fail to create pre signed url");
    }
    return { url, Key: comand.input.Key };
};
exports.createpresignedurl = createpresignedurl;
const getFile = ({ Bucket, Key, }) => {
    const command = new client_s3_1.GetObjectCommand({
        Bucket,
        Key,
    });
    return (0, exports.s3config)().send(command);
};
exports.getFile = getFile;
const createGetPreSignedUrl = async ({ Bucket = process.env.AWS_BUCKET_NAME, Key = "general", expiresIn = 120 }) => {
    const command = new client_s3_1.GetObjectCommand({
        Bucket,
        Key,
    });
    const url = await (0, s3_request_presigner_1.getSignedUrl)((0, exports.s3config)(), command, { expiresIn });
    if (!url) {
        throw new error_response_1.BadRequest("fail to get pre signed url");
    }
    return url;
};
exports.createGetPreSignedUrl = createGetPreSignedUrl;
const deleteFile = async ({ Bucket = process.env.AWS_BUCKET_NAME, Key = "general", }) => {
    const command = new client_s3_1.DeleteObjectCommand({
        Bucket,
        Key,
    });
    return (0, exports.s3config)().send(command);
};
exports.deleteFile = deleteFile;
const deleteFiles = async ({ Bucket = process.env.AWS_BUCKET_NAME, urls, Quiet = false }) => {
    const Objects = urls?.map((url) => ({
        Key: url,
    }));
    const command = new client_s3_1.DeleteObjectsCommand({
        Bucket,
        Delete: {
            Objects,
            Quiet,
        },
    });
    return (0, exports.s3config)().send(command);
};
exports.deleteFiles = deleteFiles;
const ListDirectoryFiles = async ({ Bucket = process.env.AWS_BUCKET_NAME, path, }) => {
    const command = new client_s3_1.ListObjectsV2Command({
        Bucket,
        Prefix: `${process.env.APPLICATION_NAME}/${path}`
    });
    return (0, exports.s3config)().send(command);
};
exports.ListDirectoryFiles = ListDirectoryFiles;

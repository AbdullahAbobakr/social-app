import {v4 as uuid} from "uuid"
import multer, { FileFilterCallback } from "multer";
import { BadRequest } from "../response/error.response";
import { Request } from "express";
import os from "node:os"

export enum storageEnum {
    memory = "memory",
    disk = "disk",
}

export const filevalidation = {
    image: ["image/jpeg", "image/png"],
};

export const clouduploadfile = ({
    validation = [],
    storageApproach = storageEnum.memory,
    maxSizemb = 2
}: {
    validation?: string[],
    storageApproach?: storageEnum,
    maxSizemb?: number
}): multer.Multer => {
    const storage =
        storageApproach === storageEnum.memory
            ? multer.memoryStorage()
            : multer.diskStorage({
                destination: os.tmpdir(),
                filename:function(
                    req: Request,
                    file: Express.Multer.File,
                    callback )  {
                     callback(null,`${uuid()}_${file.originalname}`)
                    }
                
            });

    function filefilter(req: Request, file: Express.Multer.File, callback: FileFilterCallback) {
        if (!validation.includes(file.mimetype)) {
            return callback(new BadRequest("file validation error", {
                validationerror: [{
                    key: "file",
                    issues: [{
                        path: "file",
                        message: "invalid file format"
                    }]
                }]
            }))
        }
        return callback(null, true)
    }

    return multer({ filefilter, limits: { fileSize: maxSizemb * 1024 * 1024 }, storage });
};

import {
    ListObjectsV2Command,
    DeleteObjectCommand,
    DeleteObjectCommandOutput,
    DeleteObjectsCommand,
    GetObjectCommand,
  ObjectCannedACL,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { storageEnum } from "./cloud.multer";
import { v4 as uuid } from "uuid";
import { createReadStream } from "fs";
import { BadRequest, NotfoundException } from "../response/error.response";
import { Upload } from "@aws-sdk/lib-storage";
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';


export const s3config = () => {
  return new S3Client({
    region: process.env.AWS_REGION as string,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
    },
  });
};

export const uploadfile = async ({
  storageApproach = storageEnum.memory,
  Bucket = process.env.AWS_BUCKET_NAME as string,
  ACL = "private",
  path = "general",
  file,
}: {
  storageApproach?: storageEnum;
  Bucket?: string;
  ACL?: ObjectCannedACL;
  path?: string;
  file: Express.Multer.File;
}): Promise<string> => {
  const command = new PutObjectCommand({
    Bucket,
    ACL,
    Key: `${path}/${uuid()}/${file.originalname}`,
    Body:
      storageApproach === storageEnum.memory
        ? file.buffer
        : createReadStream(file.path),
    ContentType: file.mimetype,
  });

  await s3config().send(command);
  if (!command?.input?.Key) {
    throw new NotfoundException("fail to upload file");
  }
  return command.input.Key as string;
};

export const uploadfiles = async ({
  storageApproach = storageEnum.memory,
  Bucket = process.env.AWS_BUCKET_NAME as string,
  ACL = "private",
  path = "general",
  files,
}: {
  storageApproach?: storageEnum;
  Bucket?: string;
  ACL?: ObjectCannedACL;
  path?: string;
  files: Express.Multer.File[];
}): Promise<string[]> => {
    
    let urls : string[]=[]
    urls= await Promise.all(files.map(file=>{
        return uploadfile({
            storageApproach,
            Bucket,
            ACL,
            path,
            file
        })
    }))
    return urls 
};

export const uploadlargefiles = async ({
  storageApproach = storageEnum.memory,
  Bucket = process.env.AWS_BUCKET_NAME as string,
  ACL = "private",
  path = "general",
  files,
}: {
  storageApproach?: storageEnum;
  Bucket?: string;
  ACL?: ObjectCannedACL;
  path?: string;
  files: Express.Multer.File[];
}): Promise<string[]> => {
    
    let urls : string[]=[]
    urls= await Promise.all(files.map(file=>{
        return uploadlargefile({
            storageApproach,
            Bucket,
            ACL,
            path,
            file
        })
    }))
    return urls 
};

export const uploadlargefile = async ({
  storageApproach = storageEnum.memory,
  Bucket = process.env.AWS_BUCKET_NAME as string,
  ACL = "private",
  path = "general",
  file,
}: {
  storageApproach?: storageEnum;
  Bucket?: string;
  ACL?: ObjectCannedACL;
  path?: string;
  file: Express.Multer.File;
}): Promise<string> => {
  const upload = new Upload({
    client: s3config(),
    params: {
      Bucket,
      ACL,
      Key: `${path}/${uuid()}/${file.originalname}`,
      Body:
        storageApproach === storageEnum.memory
          ? file.buffer
          : createReadStream(file.path),
      ContentType: file.mimetype,
    },
  });
  upload.on("httpUploadProgress", (progress) => {
    console.log(progress);
  });
  const { Key } = await upload.done();
  if (!Key) {
    throw new NotfoundException("fail to upload file");
  }
  return Key;
};

export const createpresignedurl = async({
    Bucket=process.env.AWS_BUCKET_NAME as string,
    path="general",
    expiresIn=120,
    originalname,
    ContentType,
}:{
    Bucket?:string,
    path?:string,
    expiresIn?:number,
    originalname?:string
    ContentType?:string
}):Promise<{url:string,Key:string}>=>{
    const comand = new PutObjectCommand({
        Bucket,
        Key:`${path}/${uuid()}/${originalname}`,
        ContentType,
    })

    const url = await getSignedUrl(s3config(),comand,{expiresIn})
    if(!url || !comand?.input?.Key){
        throw new BadRequest("fail to create pre signed url")
    }
    return {url, Key:comand.input.Key}
}

export const getFile=({
    Bucket,
    Key,
}:{
    Bucket?:string,
    Key?:string
})=>{
    const command = new GetObjectCommand({
        Bucket,
        Key,
    })
    return s3config().send(command)
}

export const createGetPreSignedUrl= async({
    Bucket=process.env.AWS_BUCKET_NAME as string,
    Key="general",
    expiresIn=120
}:{
    Bucket?:string,
    Key?:string,
    expiresIn:number
}):Promise<string>=>{
    const command = new GetObjectCommand({
        Bucket,
        Key,
    })
    const url = await getSignedUrl(s3config(),command,{expiresIn})
    if(!url){
        throw new BadRequest("fail to get pre signed url")
    }
    return url
}

export const deleteFile = async({
    Bucket=process.env.AWS_BUCKET_NAME as string,
    Key="general",
}:{
    Bucket?:string,
    Key?:string,
}):Promise<DeleteObjectCommandOutput>=>{
    const command = new DeleteObjectCommand({
        Bucket,
        Key,
    })
    return s3config().send(command)
}

export const deleteFiles = async({
    Bucket=process.env.AWS_BUCKET_NAME as string,
    urls,
    Quiet=false
}:{
    Bucket?:string,
    urls?:string[],
    Quiet?:boolean
}):Promise<DeleteObjectCommandOutput>=>{

  const Objects = urls?.map((url) => ({
    Key: url,
  }));

  const command = new DeleteObjectsCommand({
    Bucket,
    Delete: {
      Objects,
      Quiet,
    },
  });

  return s3config().send(command);
};

export const ListDirectoryFiles =async ({
  Bucket=process.env.AWS_BUCKET_NAME as string,
  path,
}:{
  Bucket?:string,
  path?:string
})=>{
  const command = new ListObjectsV2Command({
    Bucket,
    Prefix:`${process.env.APPLICATION_NAME}/${path}`
  })
  return s3config().send(command)
}

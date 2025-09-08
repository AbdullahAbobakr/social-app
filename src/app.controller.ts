import express, { Request, Response, Express } from "express";
import cors from "cors";
import authRouter from "./modules/auth/auth.controller";
import userRouter from "./modules/user/user.controller";
import { connectDB } from "./DB/connection.DB";
import {
  BadRequest,
  globelErrorhandling,
} from "./utils/response/error.response";
import path from "node:path";
import * as dotenv from "dotenv";
import { promisify } from "node:util";
import { pipeline } from "node:stream";
import { createGetPreSignedUrl, deleteFile, deleteFiles, getFile, ListDirectoryFiles } from "./utils/multer/s3.config";

const writePipeLine = promisify(pipeline);

dotenv.config({ path: path.join("src", "config", ".env.development") });

const bootstrap = async (): Promise<void> => {
  await connectDB();

  const port = process.env.PORT || 5000;
  const app: Express = express();

  app.use(cors(), express.json());

  app.get("/", (req: Request, res: Response) => {
    res.json({ message: "welcome" });
  });

  app.use("/", authRouter);
  app.use("/", userRouter);

//   delete file // 
app.get("/delete",async(req:Request,res:Response)=>{
    const {key} = req.query
    const result = await deleteFile({Key:key as string})
    return res.json({massage:"Done Delete",data:{result}})
})

app.get("/delete-files",async(req:Request,res:Response)=>{
    
    const result = await deleteFiles({urls:[
          
    ],
    Quiet:true})
    return res.json({massage:"Done Delete",data:{result}})
})

app.get("/delete-list",async(req:Request,res:Response)=>{
    
  const result = await ListDirectoryFiles({

  })
  if (!result?.Contents?.length) {
    throw new BadRequest("empty")
  }
  const urls:string[] = result.Contents.map((file)=>{
     return file.Key as string
  })
  await deleteFiles({urls})
    
    return res.json({massage:"Done Delete",data:{urls}})
})


// get asset //
  app.get("/upload/signed/*path", async (req, res): Promise<Response> => {
    const { path } = req.params as { path: string[] };
    if (!path?.length) {
      throw new BadRequest("invalid path", {
        validationerror: {
          Key: "params",
          issues: [{ path: "path", message: "invalid path" }],
        },
      });
    }
    
    const Key = path.join("/");
    const signedUrl = await createGetPreSignedUrl({ Key } as any);
    return res.json({ signedUrl });
  });

  app.get("/upload/*path", async (req, res): Promise<void> => {
    const { path } = req.params as { path: string[] };
    if (!path?.length) {
      throw new BadRequest("invalid path", {
        validationerror: {
          Key: "params",
          issues: [{ path: "path", message: "invalid path" }],
        },
      });
    }
    const s3Response = await getFile({ Key: path.join("/") });
    if (!s3Response?.Body) {
      throw new BadRequest("fail to fetch this resource");
    }
    res.setHeader(
      "Content-Type",
      s3Response.ContentType || "application/octet-stream"
    );
    await writePipeLine(s3Response.Body as NodeJS.ReadableStream, res);
  });

  app.use(globelErrorhandling);

  app.listen(port, () => {
    console.log(`server is running on port ${process.env.PORT}`);
  });
};

export default bootstrap;

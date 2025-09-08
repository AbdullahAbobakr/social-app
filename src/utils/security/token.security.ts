// import { roleEnum, UserModel } from './../../DB/models/user.model';
// import { sign, verify } from "jsonwebtoken";
// import { Secret, SignOptions } from "jsonwebtoken";
// import { HUserDocument } from "../../DB/models/user.model";
// import { BadRequest, unauthorizationException } from '../..//utils/response/error.response';
// import { userRepository } from '../../DB/user.repository';
// import  {v4 as uuid}  from 'uuid';
// import { TokenRepository } from '../../DB/token.repository';
// import {  Tokenmodel } from '../../DB/models/token.model';
// import { JwtPayload } from "jsonwebtoken";

// export enum signtureLevelEnum {
//     Brearer = "Brearer",
//     System = "System",
// }
// export enum Tokenenum {
//     access = "access",
//     refresh = "refresh",
// }

// export enum logoutFlagEnum {
//     only = "only",
//     all = "all",
// }

// interface CustomPayload extends JwtPayload {
//   _id: string;
//   _jti?: string;
// }
// export const generatrtoken = async ({
//     payload,
//     secret = process.env.ACCESS_USER_TOKEN_SIGNATURE as string,
//     options = { expiresIn: Number(process.env.ACCESS_TOKEN_EXPIRE_TIME) },
// }: {
//     payload: string | Buffer | object,
//     secret?: Secret,
//     options?: SignOptions,
// }
// ): Promise<string> => {

//     return sign(payload, secret, options)
// }

// export const verifytoken = async ({
//     token,
//     secret = process.env.ACCESS_USER_TOKEN_SIGNATURE as string,
// }: {
//     token: string,
//     secret?: Secret,
// }
// ): Promise<JsonWebKey> => {

//     return verify(token, secret) as JsonWebKey
// }

// export const detectSigntureLevel = async (role: roleEnum = roleEnum.user)
//     : Promise<signtureLevelEnum> => {
//     let signtureLevel: signtureLevelEnum = signtureLevelEnum.Brearer
//     switch (role) {
//         case roleEnum.admin:
//             signtureLevel = signtureLevelEnum.System
//             break;
//         default:
//             signtureLevel = signtureLevelEnum.Brearer
//             break;
//     }
//     return signtureLevel
// }

// export const getSignatures = async (signtureLevel: signtureLevelEnum = signtureLevelEnum.Brearer)
//     : Promise<{ access_signature: string, refresh_signature: string }> => {
//     let signtures: { access_signature: string, refresh_signature: string } = {
//         access_signature: "",
//         refresh_signature: ""
//     }
//     switch (signtureLevel) {
//         case signtureLevelEnum.System:
//             signtures.access_signature = process.env.ACCESS_SYSTREM_TOKEN_SIGNATURE as string
//             signtures.refresh_signature = process.env.REFRESH_SYSTREM_TOKEN_SIGNATURE as string
//             break;
//         default:
//             signtures.access_signature = process.env.ACCESS_USER_TOKEN_SIGNATURE as string
//             signtures.refresh_signature = process.env.REFRESH_USER_TOKEN_SIGNATURE as string
//             break;
//     }
//     return signtures
// }

// export const createlogincredentials = async (user: HUserDocument) => {
//     const signtureLevel = await detectSigntureLevel(user.role)
//     const signatures = await getSignatures(signtureLevel)
//     const jwtid = uuid()
//     const accessToken = await generatrtoken({
//         payload: { id: user._id },
//         secret: signatures.access_signature,
//         options: { expiresIn: Number(process.env.ACCESS_TOKEN_EXPIRE_TIME) , jwtid}
//     })
//     const refreshToken = await generatrtoken({
//         payload: { id: user._id },
//         secret: signatures.refresh_signature,
//         options: { expiresIn: Number(process.env.REFRESH_TOKEN_EXPIRE_TIME) , jwtid}
//     })
//     return { accessToken, refreshToken }
// }

// export const decodeToken = async ({
//     authorization,
//     tokenType = Tokenenum.access
// }: {
//     authorization: string,
//     tokenType?: Tokenenum
// }) => {
//     const userModel = new userRepository(UserModel)
//     const tokenmodel = new TokenRepository(Tokenmodel)
//     const [bearerKey, token] = authorization.split(" ")
//     if (!bearerKey || !token) {
//         throw new unauthorizationException("invalid token")
//     }

//     const signatures = await getSignatures(bearerKey as signtureLevelEnum)

//     const decoded = await verifytoken({
//         token,
//         secret: tokenType === Tokenenum.refresh 
//             ? signatures.refresh_signature 
//             : signatures.access_signature
//     })
    
//     if (!decoded?._id) {
//         throw new BadRequest("invalid token payload")
//     }

//     if(await tokenmodel.findone({
//         filter:{jti:decoded?._jti as string}
//     })){
//         throw new unauthorizationException("invalid token")
//     }

//     const user = await userModel.findone({ filter: { _id: decoded._id } })
//     if (!user) {
//         throw new BadRequest("no user for this token")
//     }
//     if( user.changeCredentailsTime?.getTime() || 0  >  decoded.iat * 1000){
//          throw new unauthorizationException("invalid token")
//     }

//     return { decoded, user }
// }

import { roleEnum, UserModel } from './../../DB/models/user.model';
import { sign, verify, JwtPayload, Secret, SignOptions } from "jsonwebtoken";
import { HUserDocument } from "../../DB/models/user.model";
import { BadRequest, unauthorizationException } from '../..//utils/response/error.response';
import { userRepository } from '../../DB/user.repository';
import { v4 as uuid } from 'uuid';
import { TokenRepository } from '../../DB/token.repository';
import { Tokenmodel } from '../../DB/models/token.model';

// ================== ENUMS ==================
export enum signtureLevelEnum {
    Brearer = "Brearer",
    System = "System",
}
export enum Tokenenum {
    access = "access",
    refresh = "refresh",
}
export enum logoutFlagEnum {
    only = "only",
    all = "all",
}

// ================== INTERFACES ==================
interface CustomPayload extends JwtPayload {
    id: string;   // لانك عامل payload: { id: user._id }
    jti?: string;
}

// ================== GENERATE TOKEN ==================
export const generatrtoken = async ({
    payload,
    secret = process.env.ACCESS_USER_TOKEN_SIGNATURE as string,
    options = { expiresIn: process.env.ACCESS_TOKEN_EXPIRE_TIME || "1h" },
}: {
    payload: string | Buffer | object,
    secret?: Secret,
    options?: SignOptions,
}): Promise<string> => {
    return sign(payload, secret, options);
};

// ================== VERIFY TOKEN ==================
export const verifytoken = async ({
    token,
    secret = process.env.ACCESS_USER_TOKEN_SIGNATURE as string,
}: {
    token: string,
    secret?: Secret,
}): Promise<CustomPayload> => {
    const decoded = verify(token, secret);
    if (typeof decoded === "string") {
        throw new BadRequest("invalid token payload"); // عشان ميبقاش string
    }
    return decoded as CustomPayload;
};

// ================== SIGNATURE LEVEL ==================
export const detectSigntureLevel = async (role: roleEnum = roleEnum.user)
    : Promise<signtureLevelEnum> => {
    let signtureLevel: signtureLevelEnum = signtureLevelEnum.Brearer;
    switch (role) {
        case roleEnum.admin:
            signtureLevel = signtureLevelEnum.System;
            break;
        default:
            signtureLevel = signtureLevelEnum.Brearer;
            break;
    }
    return signtureLevel;
};

export const getSignatures = async (signtureLevel: signtureLevelEnum = signtureLevelEnum.Brearer)
    : Promise<{ access_signature: string, refresh_signature: string }> => {
    let signtures: { access_signature: string, refresh_signature: string } = {
        access_signature: "",
        refresh_signature: ""
    };
    switch (signtureLevel) {
        case signtureLevelEnum.System:
            signtures.access_signature = process.env.ACCESS_SYSTREM_TOKEN_SIGNATURE as string;
            signtures.refresh_signature = process.env.REFRESH_SYSTREM_TOKEN_SIGNATURE as string;
            break;
        default:
            signtures.access_signature = process.env.ACCESS_USER_TOKEN_SIGNATURE as string;
            signtures.refresh_signature = process.env.REFRESH_USER_TOKEN_SIGNATURE as string;
            break;
    }
    return signtures;
};

// ================== CREATE CREDENTIALS ==================
export const createlogincredentials = async (user: HUserDocument) => {
    const signtureLevel = await detectSigntureLevel(user.role);
    const signatures = await getSignatures(signtureLevel);

    const jwtid = uuid();

    const accessToken = await generatrtoken({
        payload: { id: user._id },
        secret: signatures.access_signature,
        options: { expiresIn: process.env.ACCESS_TOKEN_EXPIRE_TIME || "1h", jwtid }
    });

    const refreshToken = await generatrtoken({
        payload: { id: user._id },
        secret: signatures.refresh_signature,
        options: { expiresIn: process.env.REFRESH_TOKEN_EXPIRE_TIME || "7d", jwtid }
    });

    return { accessToken, refreshToken };
};

// ================== DECODE TOKEN ==================
export const decodeToken = async ({
    authorization,
    tokenType = Tokenenum.access
}: {
    authorization: string,
    tokenType?: Tokenenum
}) => {
    const userModel = new userRepository(UserModel);
    const tokenmodel = new TokenRepository(Tokenmodel);

    const [bearerKey, token] = authorization.split(" ");
    if (!bearerKey || !token) {
        throw new unauthorizationException("invalid token");
    }

    const signatures = await getSignatures(bearerKey as signtureLevelEnum);

    const decoded = await verifytoken({
        token,
        secret: tokenType === Tokenenum.refresh
            ? signatures.refresh_signature
            : signatures.access_signature
    });

    if (!decoded?.id) {
        throw new BadRequest("invalid token payload");
    }

    if (await tokenmodel.findone({
        filter: { jti: decoded?.jti as string }
    })) {
        throw new unauthorizationException("invalid token");
    }

    const user = await userModel.findone({ filter: { _id: decoded.id } });
    if (!user) {
        throw new BadRequest("no user for this token");
    }

    if ((user.changeCredentailsTime?.getTime() || 0) > (decoded.iat! * 1000)) {
        throw new unauthorizationException("invalid token");
    }

    return { decoded, user };
};

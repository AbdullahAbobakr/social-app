"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.globelErrorhandling = exports.NotfoundException = exports.BadRequest = exports.Applicationerror = void 0;
class Applicationerror extends Error {
    statuscode;
    constructor(message, statuscode, cause) {
        super(message, { cause });
        this.statuscode = statuscode;
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.Applicationerror = Applicationerror;
class BadRequest extends Applicationerror {
    constructor(message, cause) {
        super(message, 400, cause);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.BadRequest = BadRequest;
class NotfoundException extends Applicationerror {
    constructor(message, cause) {
        super(message, 400, cause);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.NotfoundException = NotfoundException;
const globelErrorhandling = (error, req, res, next) => {
    return res.
        status(201).
        json({ err_message: error.message, stack: error.stack, error });
};
exports.globelErrorhandling = globelErrorhandling;

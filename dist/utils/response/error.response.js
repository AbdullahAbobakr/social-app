"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.globelErrorhandling = exports.ForbiddenException = exports.unauthorizationException = exports.NotfoundException = exports.BadRequest = exports.Applicationerror = void 0;
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
    }
}
exports.BadRequest = BadRequest;
class NotfoundException extends Applicationerror {
    constructor(message, cause) {
        super(message, 404, cause);
    }
}
exports.NotfoundException = NotfoundException;
class unauthorizationException extends Applicationerror {
    constructor(message, cause) {
        super(message, 401, cause);
    }
}
exports.unauthorizationException = unauthorizationException;
class ForbiddenException extends Applicationerror {
    constructor(message, cause) {
        super(message, 403, cause);
    }
}
exports.ForbiddenException = ForbiddenException;
const globelErrorhandling = (error, req, res, next) => {
    return res.status(error.statuscode || 500).json({
        err_message: error.message,
        stack: error.stack,
        error,
    });
};
exports.globelErrorhandling = globelErrorhandling;

import { Request, Response, NextFunction } from "express";

interface Ierror extends Error {
  statuscode: number;
}

export class Applicationerror extends Error {
  constructor(
    message: string,
    public statuscode: number,
    cause?: unknown
  ) {
    super(message, { cause });
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequest extends Applicationerror {
  constructor(message: string, cause?: unknown) {
    super(message, 400, cause);
  }
}

export class NotfoundException extends Applicationerror {
  constructor(message: string, cause?: unknown) {
    super(message, 404, cause);
  }
}

export class unauthorizationException extends Applicationerror {
  constructor(message: string, cause?: unknown) {
    super(message, 401, cause);
  }
}

export class ForbiddenException extends Applicationerror {
  constructor(message: string, cause?: unknown) {
    super(message, 403, cause);
  }
}

export const globelErrorhandling = (
  error: Ierror,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  return res.status(error.statuscode || 500).json({
    err_message: error.message,
    stack: error.stack,
    error,
  });
};

import { validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";

interface IValidationError extends Error {
  status?: number;
  errors?: any[];
}

const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error: IValidationError = new Error("Validation failed");
    error.status = 400;
    error.errors = errors.array().map((error) => ({
      field: (error as any).path || (error as any).param,
      message: (error as any).msg,
    }));
    return next(error);
  }
  next();
};

export default validate;

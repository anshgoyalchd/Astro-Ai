import { validationResult } from 'express-validator';

export function validateRequest(req, _res, next) {
  const result = validationResult(req);

  if (!result.isEmpty()) {
    const error = new Error(result.array()[0].msg);
    error.statusCode = 400;
    return next(error);
  }

  next();
}

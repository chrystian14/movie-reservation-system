import type { Request, Response, NextFunction } from "express";
import { ApiError, BodyValidationError } from "./api.errors";
import { status } from "modules/_shared/utils";
import { Logger } from "configs/loggers";

export function handleGlobalErrors(
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (error instanceof ApiError) {
    return res.status(error.statusCode).json({
      details: error.message,
    });
  }

  if (error instanceof BodyValidationError) {
    return res.status(error.statusCode).json({
      details: error.errors.map(({ path, message }) => ({
        field: path,
        message,
      })),
    });
  }

  Logger.error(error.message);

  return res.status(status.HTTP_500_INTERNAL_SERVER_ERROR).json({
    details: "Internal Server Error",
  });
}

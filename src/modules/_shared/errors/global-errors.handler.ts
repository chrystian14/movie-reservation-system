import type { Request, Response, NextFunction } from "express";
import { ApiError } from "./api.errors";
import { status } from "modules/_shared/utils";

export function handleGlobalErrors(
  error: Error,
  req: Request,
  res: Response,
  _: NextFunction
) {
  if (error instanceof ApiError) {
    return res.status(error.statusCode).json({
      details: error.message,
    });
  }

  console.error(error.message);

  return res.status(status.HTTP_500_INTERNAL_SERVER_ERROR).json({
    details: "Internal Server Error",
  });
}

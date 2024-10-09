import type { NextFunction, Request, Response } from "express";
import { UnauthorizedError } from "modules/_shared/errors";
import { verifyToken } from "../jwt";

export function isAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { authorization } = req.headers;

  if (!authorization) {
    throw new UnauthorizedError(
      "Missing authorization header with bearer token"
    );
  }

  const [type, token] = authorization.split(" ");

  if (type !== "Bearer" || !token) {
    throw new UnauthorizedError(
      "Invalid authorization header format. Accepted format is 'Bearer <token>'"
    );
  }

  res.locals.verifiedToken = verifyToken(token);

  return next();
}

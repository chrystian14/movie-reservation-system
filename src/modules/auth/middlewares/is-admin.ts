import type { Request, NextFunction } from "express";
import { ForbiddenError } from "modules/_shared/errors";
import type { AuthenticatedResponse } from "../types";

export function isAdmin(
  req: Request,
  res: AuthenticatedResponse,
  next: NextFunction
) {
  const { isAdmin } = res.locals.authenticatedUser;

  if (!isAdmin) {
    throw new ForbiddenError();
  }

  return next();
}

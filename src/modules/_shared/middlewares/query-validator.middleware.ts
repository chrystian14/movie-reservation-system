import type { NextFunction, Request, Response } from "express";
import type { ZodSchema } from "zod";
import { BodyValidationError } from "../errors";

export function validateQueryParams(schema: ZodSchema) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const parseResult = schema.safeParse(req.query);

    if (!parseResult.success) {
      throw new BodyValidationError(parseResult.error);
    }

    return next();
  };
}

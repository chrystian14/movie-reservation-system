import type { NextFunction, Request, Response } from "express";

export const MAX_PER_PAGE_NUMBER = 10;

export function validatePaginationQuery(
  queryPage?: number,
  queryPerPage?: number
) {
  const page = queryPage && queryPage > 1 ? queryPage : 1;
  const perPage =
    queryPerPage && queryPerPage > 0 && queryPerPage < MAX_PER_PAGE_NUMBER
      ? queryPerPage
      : MAX_PER_PAGE_NUMBER;

  return { page, perPage };
}

export function handlePaginationParams(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const queryPage = Number(req.query.page);
  const queryPerPage = Number(req.query.perPage);

  const { page, perPage } = validatePaginationQuery(queryPage, queryPerPage);

  res.locals = { ...res.locals, page, perPage };

  return next();
}

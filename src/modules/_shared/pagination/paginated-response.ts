import type { Request } from "express";

export type PaginatedResponse<T> = {
  count: number;
  previousPage: string | null;
  nextPage: string | null;
  data: T[];
};

export function getPaginatedResponse<T>(
  count: number,
  page: number,
  perPage: number,
  data: T[],
  req: Request
): PaginatedResponse<T> {
  const baseUrl = `${req.protocol}://${req.headers.host}${req.baseUrl}`;

  const previousPage =
    page > 1 ? `${baseUrl}?page=${page - 1}&perPage=${perPage}` : null;
  const nextPage =
    page * perPage < count
      ? `${baseUrl}?page=${page + 1}&perPage=${perPage}`
      : null;

  return {
    count,
    previousPage,
    nextPage,
    data,
  };
}

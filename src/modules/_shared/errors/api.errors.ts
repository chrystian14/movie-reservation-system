import { status } from "modules/_shared/utils";

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = status.HTTP_500_INTERNAL_SERVER_ERROR
  ) {
    super(message);
  }
}

export class ConflictError extends ApiError {
  constructor(
    message: string,
    readonly statusCode: number = status.HTTP_409_CONFLICT
  ) {
    super(message, statusCode);
  }
}

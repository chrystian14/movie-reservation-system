import { status } from "modules/_shared/utils";
import { ZodError } from "zod";

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = status.HTTP_500_INTERNAL_SERVER_ERROR
  ) {
    super(message);
  }
}

export class BodyValidationError extends ZodError {
  constructor(
    error: ZodError,
    readonly statusCode: number = status.HTTP_400_BAD_REQUEST
  ) {
    super(error.errors);
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

export class UnauthorizedError extends ApiError {
  constructor(
    message: string,
    readonly statusCode: number = status.HTTP_401_UNAUTHORIZED
  ) {
    super(message, statusCode);
  }
}

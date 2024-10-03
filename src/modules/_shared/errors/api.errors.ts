import { status } from "modules/_shared/utils";

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = status.HTTP_500_INTERNAL_SERVER_ERROR
  ) {
    super(message);
  }
}

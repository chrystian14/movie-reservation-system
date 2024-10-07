import { UnauthorizedError } from "modules/_shared/errors";

export class InvalidCredentialsError extends UnauthorizedError {
  constructor(readonly message: string = "Invalid credentials") {
    super(message);
  }
}

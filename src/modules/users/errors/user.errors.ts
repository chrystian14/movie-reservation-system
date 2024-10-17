import { ConflictError, NotFoundError } from "modules/_shared/errors";

export class EmailAlreadyExistsError extends ConflictError {
  constructor(readonly message: string = "Email already exists") {
    super(message);
  }
}

export class UserNotFoundError extends NotFoundError {
  constructor(readonly message: string = "User not found") {
    super(message);
  }
}

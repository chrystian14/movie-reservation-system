import { ConflictError } from "modules/_shared/errors";

export class EmailAlreadyExistsError extends ConflictError {
  constructor(readonly message: string = "Email already exists") {
    super(message);
  }
}

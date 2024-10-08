import { ConflictError } from "modules/_shared/errors";

export class GenreNameAlreadyExistsError extends ConflictError {
  constructor(readonly message: string = "Genre name already exists") {
    super(message);
  }
}

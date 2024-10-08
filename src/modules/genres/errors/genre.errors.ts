import { ConflictError, NotFoundError } from "modules/_shared/errors";

export class GenreNameAlreadyExistsError extends ConflictError {
  constructor(readonly message: string = "Genre name already exists") {
    super(message);
  }
}

export class GenreNotFoundError extends NotFoundError {
  constructor(readonly message: string = "Genre not found") {
    super(message);
  }
}

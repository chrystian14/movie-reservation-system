import { NotFoundError } from "modules/_shared/errors";

export class MovieNotFoundError extends NotFoundError {
  constructor(readonly message: string = "Movie not found") {
    super(message);
  }
}

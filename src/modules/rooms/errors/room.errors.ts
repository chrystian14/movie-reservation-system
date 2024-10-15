import { NotFoundError } from "modules/_shared/errors";

export class RoomNotFoundError extends NotFoundError {
  constructor(readonly message: string = "Room not found") {
    super(message);
  }
}

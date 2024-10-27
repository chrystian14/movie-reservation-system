import { NotFoundError } from "modules/_shared/errors";

export class ReservationNotFoundError extends NotFoundError {
  constructor() {
    super("Reservation not found");
  }
}

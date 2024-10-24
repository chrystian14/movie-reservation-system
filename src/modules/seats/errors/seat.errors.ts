import { UnprocessableEntity } from "modules/_shared/errors";

export class SeatAlreadyReservedError extends UnprocessableEntity {
  constructor(
    reservedSeatsIds: Array<string>,
    readonly message: string = "Seat(s) already reserved"
  ) {
    super(message);
    this.errors = reservedSeatsIds.map((seatId) => ({ seatId, message }));
  }
}

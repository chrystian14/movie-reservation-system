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

export class SeatNotInShowtimeError extends UnprocessableEntity {
  constructor(
    seatsNotFound: Array<string>,
    readonly message: string = "Seat(s) not found in showtime room"
  ) {
    super(message);
    this.errors = seatsNotFound.map((seatId) => ({ seatId, message }));
  }
}

export class SeatColumnRowAlreadyTaken extends UnprocessableEntity {
  constructor(readonly message: string = "Seat column and row already taken") {
    super(message);
  }
}

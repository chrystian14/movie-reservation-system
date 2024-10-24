import { randomUUID } from "crypto";
import type { IReservationRepository } from "../repository";
import type {
  Reservation,
  ReservationCreateInput,
  ReservationCreateInputWithoutUserId,
} from "../types";
import { Prisma, ReservationStatus } from "@prisma/client";
import { Chance } from "chance";

export class ReservationBuilder {
  protected entity: Reservation;
  protected chance: Chance.Chance;
  protected _seatIds: [string, ...string[]];

  constructor() {
    this.chance = new Chance();
    const randomPriceString = this.chance.floating({
      min: 1,
      max: 100,
      fixed: 2,
    });

    this.entity = {
      id: randomUUID(),
      status: ReservationStatus.CONFIRMED,
      amountPaid: new Prisma.Decimal(randomPriceString),
      userId: randomUUID(),
      showtimeId: randomUUID(),
      seatId: randomUUID(),
    };

    this._seatIds = [this.entity.seatId];
  }

  build() {
    return this.entity;
  }

  async save(repository: IReservationRepository) {
    const reservationCreateInput: ReservationCreateInput = {
      userId: this.entity.userId,
      showtimeId: this.entity.showtimeId,
      amountPaid: this.entity.amountPaid,
      seatIds: this._seatIds,
    };

    return await repository.create(reservationCreateInput);
  }

  withNewUUID() {
    this.entity.id = randomUUID();
    return this;
  }

  withUserId(userId: string) {
    this.entity.userId = userId;
    return this;
  }

  withShowtimeId(showtimeId: string) {
    this.entity.showtimeId = showtimeId;
    return this;
  }

  withAmountPaid(amountPaid: number | Prisma.Decimal) {
    this.entity.amountPaid =
      amountPaid instanceof Prisma.Decimal
        ? amountPaid
        : new Prisma.Decimal(amountPaid);

    return this;
  }

  withSeatIds(seatIds: [string, ...string[]]) {
    this._seatIds = seatIds;
    return this;
  }

  withConfirmedStatus() {
    this.entity.status = ReservationStatus.CONFIRMED;
    return this;
  }

  withCancelledStatus() {
    this.entity.status = ReservationStatus.CANCELLED;
    return this;
  }

  requiredForCreation(): ReservationCreateInput {
    return {
      userId: this.entity.userId,
      showtimeId: this.entity.showtimeId,
      amountPaid: this.entity.amountPaid,
      seatIds: this._seatIds,
    };
  }

  requiredForPostBody(): ReservationCreateInputWithoutUserId {
    return {
      showtimeId: this.entity.showtimeId,
      amountPaid: this.entity.amountPaid,
      seatIds: this._seatIds,
    };
  }
}

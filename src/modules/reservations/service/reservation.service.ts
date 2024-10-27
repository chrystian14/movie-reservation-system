import type { IShowtimeRepository } from "modules/showtimes/repository";
import type { IReservationRepository } from "../repository";
import type { Reservation, ReservationCreateInput } from "../types";
import type { IReservationService } from "./reservation.service.interface";
import type { ISeatRepository } from "modules/seats/repository";
import type { IUserRepository } from "modules/users/repository";
import { ShowtimeNotFoundError } from "modules/showtimes/errors";
import { UserNotFoundError } from "modules/users/errors";
import { SeatAlreadyReservedError } from "modules/seats/errors";
import { ReservationStatus } from "@prisma/client";
import { ReservationNotFoundError } from "../errors";

export class ReservationService implements IReservationService {
  constructor(
    private readonly reservationRepository: IReservationRepository,
    private readonly showtimeRepository: IShowtimeRepository,
    private readonly seatRepository: ISeatRepository,
    private readonly userRepository: IUserRepository
  ) {}

  async cancel(reservationId: string, userId: string): Promise<void> {
    const reservation = await this.reservationRepository.findById(
      reservationId
    );

    if (!reservation) {
      throw new ReservationNotFoundError();
    }

    const userCount = await this.userRepository.countById(userId);

    if (!userCount) {
      throw new UserNotFoundError();
    }

    await this.reservationRepository.cancel(reservationId);
  }

  async listByUserId(userId: string): Promise<Array<Reservation>> {
    const userCount = await this.userRepository.countById(userId);

    if (!userCount) {
      throw new UserNotFoundError();
    }

    return await this.reservationRepository.listByUserId(
      userId,
      ReservationStatus.CONFIRMED
    );
  }

  async create(
    reservationCreateInput: ReservationCreateInput
  ): Promise<Array<Reservation>> {
    const showtimeCount = await this.showtimeRepository.countById(
      reservationCreateInput.showtimeId
    );

    if (!showtimeCount) {
      throw new ShowtimeNotFoundError();
    }

    const userCount = await this.userRepository.countById(
      reservationCreateInput.userId
    );

    if (!userCount) {
      throw new UserNotFoundError();
    }

    const seatsAlreadyReserved =
      await this.seatRepository.scanForReservedSeatsByShowtimeId(
        reservationCreateInput.seatIds,
        reservationCreateInput.showtimeId
      );

    if (seatsAlreadyReserved.length > 0) {
      throw new SeatAlreadyReservedError(seatsAlreadyReserved);
    }

    return await this.reservationRepository.create(reservationCreateInput);
  }
}

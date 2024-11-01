import type { IShowtimeRepository } from "modules/showtimes/repository";
import type { IReservationRepository } from "../repository";
import type { Reservation, ReservationCreateInput } from "../types";
import type { IReservationService } from "./reservation.service.interface";
import type { ISeatRepository } from "modules/seats/repository";
import type { IUserRepository } from "modules/users/repository";
import { ShowtimeNotFoundError } from "modules/showtimes/errors";
import { UserNotFoundError } from "modules/users/errors";
import {
  SeatAlreadyReservedError,
  SeatNotInShowtimeError,
} from "modules/seats/errors";
import { ReservationStatus } from "@prisma/client";
import { ReservationNotFoundError } from "../errors";
import { ForbiddenError } from "modules/_shared/errors";
import { ShowtimeInThePastError } from "modules/showtimes/errors/showtime.errors";

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

    if (reservation.userId !== userId) {
      throw new ForbiddenError();
    }

    const showtime = await this.showtimeRepository.findById(
      reservation.showtimeId
    );

    if (showtime && showtime.datetime < new Date()) {
      throw new ShowtimeInThePastError();
    }

    await this.reservationRepository.cancel(reservationId);
  }

  async list(): Promise<Array<Reservation>> {
    return await this.reservationRepository.list();
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
    // const showtimeCount = await this.showtimeRepository.countById(
    //   reservationCreateInput.showtimeId
    // );
    const showtime = await this.showtimeRepository.findById(
      reservationCreateInput.showtimeId
    );

    if (!showtime) {
      throw new ShowtimeNotFoundError();
    }

    const userCount = await this.userRepository.countById(
      reservationCreateInput.userId
    );

    if (!userCount) {
      throw new UserNotFoundError();
    }

    const seatsInShowtimeRoom = await this.seatRepository.scanForSeatsInRoom(
      showtime.roomId,
      reservationCreateInput.seatIds
    );

    if (seatsInShowtimeRoom.length !== reservationCreateInput.seatIds.length) {
      const seatsNotFound = reservationCreateInput.seatIds.filter(
        (seatId) => !seatsInShowtimeRoom.some((seat) => seat.id === seatId)
      );
      throw new SeatNotInShowtimeError(seatsNotFound);
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

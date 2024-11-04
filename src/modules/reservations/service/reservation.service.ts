import type { IShowtimeDao } from "modules/showtimes/dao";
import type { IReservationDao } from "../dao";
import type { Reservation, ReservationCreateInput } from "../types";
import type { IReservationService } from "./reservation.service.interface";
import type { ISeatDao } from "modules/seats/dao";
import type { IUserDao } from "modules/users/dao";
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
    private readonly reservationDao: IReservationDao,
    private readonly showtimeDao: IShowtimeDao,
    private readonly seatDao: ISeatDao,
    private readonly userDao: IUserDao
  ) {}

  async cancel(reservationId: string, userId: string): Promise<void> {
    const reservation = await this.reservationDao.findById(reservationId);

    if (!reservation) {
      throw new ReservationNotFoundError();
    }

    const userCount = await this.userDao.countById(userId);

    if (!userCount) {
      throw new UserNotFoundError();
    }

    if (reservation.userId !== userId) {
      throw new ForbiddenError();
    }

    const showtime = await this.showtimeDao.findById(reservation.showtimeId);

    if (showtime && showtime.datetime < new Date()) {
      throw new ShowtimeInThePastError();
    }

    await this.reservationDao.cancel(reservationId);
  }

  async list(): Promise<Array<Reservation>> {
    return await this.reservationDao.list();
  }

  async listByUserId(userId: string): Promise<Array<Reservation>> {
    const userCount = await this.userDao.countById(userId);

    if (!userCount) {
      throw new UserNotFoundError();
    }

    return await this.reservationDao.listByUserId(
      userId,
      ReservationStatus.CONFIRMED
    );
  }

  async create(
    reservationCreateInput: ReservationCreateInput
  ): Promise<Array<Reservation>> {
    // const showtimeCount = await this.showtimeDao.countById(
    //   reservationCreateInput.showtimeId
    // );
    const showtime = await this.showtimeDao.findById(
      reservationCreateInput.showtimeId
    );

    if (!showtime) {
      throw new ShowtimeNotFoundError();
    }

    const userCount = await this.userDao.countById(
      reservationCreateInput.userId
    );

    if (!userCount) {
      throw new UserNotFoundError();
    }

    const seatsInShowtimeRoom = await this.seatDao.scanForSeatsInRoom(
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
      await this.seatDao.scanForReservedSeatsByShowtimeId(
        reservationCreateInput.seatIds,
        reservationCreateInput.showtimeId
      );

    if (seatsAlreadyReserved.length > 0) {
      throw new SeatAlreadyReservedError(seatsAlreadyReserved);
    }

    return await this.reservationDao.create(reservationCreateInput);
  }
}

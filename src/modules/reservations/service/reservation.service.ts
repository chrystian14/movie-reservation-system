import type { IShowtimeRepository } from "modules/showtimes/repository";
import type { IReservationRepository } from "../repository";
import type { Reservation, ReservationCreateInput } from "../types";
import type { IReservationService } from "./reservation.service.interface";
import type { ISeatRepository } from "modules/seats/repository";
import type { IUserRepository } from "modules/users/repository";
import { ShowtimeNotFoundError } from "modules/showtimes/errors";
import { UserNotFoundError } from "modules/users/errors";

export class ReservationService implements IReservationService {
  constructor(
    private readonly reservationRepository: IReservationRepository,
    private readonly showtimeRepository: IShowtimeRepository,
    private readonly seatRepository: ISeatRepository,
    private readonly userRepository: IUserRepository
  ) {}

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

    return await this.reservationRepository.create(reservationCreateInput);
  }
}

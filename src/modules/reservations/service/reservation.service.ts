import type { IShowtimeRepository } from "modules/showtimes/repository";
import type { IReservationRepository } from "../repository";
import type { Reservation, ReservationCreateInput } from "../types";
import type { IReservationService } from "./reservation.service.interface";
import type { ISeatRepository } from "modules/seats/repository";
import type { IUserRepository } from "modules/users/repository";
import { ShowtimeNotFoundError } from "modules/showtimes/errors";

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

    return await this.reservationRepository.create(reservationCreateInput);
  }
}

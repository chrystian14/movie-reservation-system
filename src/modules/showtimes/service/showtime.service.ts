import type { IRoomRepository } from "modules/rooms/repository";
import type { IShowtimeRepository } from "../repository";
import type { Showtime, ShowtimeCreateInput } from "../types";
import type { IShowtimeService } from "./showtime.service.interface";
import type { IMovieRepository } from "modules/movies/repository";
import { RoomNotFoundError } from "modules/rooms/errors";
import { MovieNotFoundError } from "modules/movies/errors";
import { DatetimeInThePastError } from "../errors";
import type { Seat } from "modules/seats/types";
import type { ISeatRepository } from "modules/seats/repository";
import { ShowtimeNotFoundError } from "../errors/showtime.errors";

export class ShowtimeService implements IShowtimeService {
  constructor(
    private readonly showtimeRepository: IShowtimeRepository,
    private readonly roomRepository: IRoomRepository,
    private readonly movieRepository: IMovieRepository,
    private readonly seatRepository: ISeatRepository
  ) {}

  async create(showtimeCreateInput: ShowtimeCreateInput): Promise<Showtime> {
    const roomCount = await this.roomRepository.countById(
      showtimeCreateInput.roomId
    );

    if (!roomCount) {
      throw new RoomNotFoundError();
    }

    const movieCount = await this.movieRepository.countById(
      showtimeCreateInput.movieId
    );

    if (!movieCount) {
      throw new MovieNotFoundError();
    }

    if (showtimeCreateInput.datetime < new Date()) {
      throw new DatetimeInThePastError();
    }

    return await this.showtimeRepository.create(showtimeCreateInput);
  }

  async list(): Promise<Array<Showtime>> {
    return await this.showtimeRepository.list();
  }

  async getAvailableSeats(showtimeId: string): Promise<Array<Seat>> {
    const showtimeCount = await this.showtimeRepository.countById(showtimeId);

    if (!showtimeCount) {
      throw new ShowtimeNotFoundError();
    }

    return await this.seatRepository.getAvailableSeats(showtimeId);
  }
}

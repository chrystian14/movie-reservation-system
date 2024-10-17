import type { IRoomRepository } from "modules/rooms/repository";
import type { IShowtimeRepository } from "../repository";
import type { Showtime, ShowtimeCreateInput } from "../types";
import type { IShowtimeService } from "./showtime.service.interface";
import type { IMovieRepository } from "modules/movies/repository";
import { RoomNotFoundError } from "modules/rooms/errors";
import { MovieNotFoundError } from "modules/movies/errors";
import { DatetimeInThePastError } from "../errors";

export class ShowtimeService implements IShowtimeService {
  constructor(
    private readonly showtimeRepository: IShowtimeRepository,
    private readonly roomRepository: IRoomRepository,
    private readonly movieRepository: IMovieRepository
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
}

import type { IRoomRepository } from "modules/rooms/repository";
import type { IShowtimeRepository } from "../repository";
import type { Showtime, ShowtimeCreateInput } from "../types";
import type { IShowtimeService } from "./showtime.service.interface";
import type { IMovieRepository } from "modules/movies/repository";
import { RoomNotFoundError } from "modules/rooms/errors";
import { MovieNotFoundError } from "modules/movies/errors";

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

    if (roomCount === 0) {
      throw new RoomNotFoundError();
    }

    const movieCount = await this.movieRepository.countById(
      showtimeCreateInput.movieId
    );

    if (movieCount === 0) {
      throw new MovieNotFoundError();
    }

    return await this.showtimeRepository.create(showtimeCreateInput);
  }
}

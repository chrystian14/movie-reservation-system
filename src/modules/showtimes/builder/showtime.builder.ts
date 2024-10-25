import { randomUUID } from "crypto";
import type { IShowtimeRepository } from "../repository";
import type { Showtime, ShowtimeCreateInput } from "../types";
import { Chance } from "chance";

type FixedLengthArray<
  T,
  N extends number,
  R extends T[] = []
> = R["length"] extends N ? R : FixedLengthArray<T, N, [T, ...R]>;

export class ShowtimeBuilder {
  protected entity: Showtime;
  protected entities: Showtime[] = [];
  protected chance: Chance.Chance;

  constructor() {
    this.chance = new Chance();

    this.entity = {
      id: randomUUID(),
      movieId: randomUUID(),
      roomId: randomUUID(),
      datetime: this.chance.date(),
    };
  }

  build() {
    return this.entity;
  }

  buildMany<Length extends number>(
    movieId: string,
    roomId: string,
    numberOfShowtimes: Length,
    startDatetime: Date,
    intervalMinutes: number
  ): FixedLengthArray<Showtime, Length> {
    const showtimes: Showtime[] = [];

    for (let i = 0; i < numberOfShowtimes; i++) {
      const showtime = new ShowtimeBuilder()
        .withMovieId(movieId)
        .withRoomId(roomId)
        .withIsoDatetime(
          new Date(
            startDatetime.getTime() + i * intervalMinutes * 60000
          ).toISOString()
        )
        .build();
      this.entities.push(showtime);
      showtimes.push(showtime);
    }

    return showtimes as FixedLengthArray<Showtime, Length>;
  }

  async save(repository: IShowtimeRepository): Promise<Showtime> {
    return await repository.create(this.entity);
  }

  async saveAll(repository: IShowtimeRepository): Promise<Showtime[]> {
    const savedShowtimes = [];
    for (const showtime of this.entities) {
      const savedShowtime = await repository.create(showtime);
      savedShowtimes.push(savedShowtime);
    }
    return savedShowtimes;
  }

  withNewUUID() {
    this.entity.id = randomUUID();
    return this;
  }

  withRoomId(roomId: string) {
    this.entity.roomId = roomId;
    return this;
  }

  withMovieId(movieId: string) {
    this.entity.movieId = movieId;
    return this;
  }

  withIsoDatetime(isoDatetime: string) {
    this.entity.datetime = new Date(isoDatetime);

    return this;
  }

  requiredForCreation(): ShowtimeCreateInput {
    return {
      movieId: this.entity.movieId,
      roomId: this.entity.roomId,
      datetime: this.entity.datetime,
    };
  }
}

import { randomUUID } from "crypto";
import type { IShowtimeDao } from "../dao";
import type { Showtime, ShowtimeCreateInput } from "../types";
import { Chance } from "chance";
import type { FixedLengthArray } from "modules/_shared/utils/types.util";

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

  async save(dao: IShowtimeDao): Promise<Showtime> {
    return await dao.create(this.entity);
  }

  async saveAll(dao: IShowtimeDao): Promise<Showtime[]> {
    const savedShowtimes = [];
    for (const showtime of this.entities) {
      const savedShowtime = await dao.create(showtime);
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

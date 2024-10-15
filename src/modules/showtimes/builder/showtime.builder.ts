import { randomUUID } from "crypto";
import type { IShowtimeRepository } from "../repository";
import type { Showtime, ShowtimeCreateInput } from "../types";
import { Chance } from "chance";

export class ShowtimeBuilder {
  protected entity: Showtime;
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

  async save(repository: IShowtimeRepository) {
    return await repository.create(this.entity);
  }

  withNewUUID() {
    this.entity.id = randomUUID();
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

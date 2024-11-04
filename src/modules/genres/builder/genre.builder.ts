import { randomUUID } from "crypto";
import type { IGenreDao } from "../dao";
import type { Genre, GenreCreateInput } from "../types";

export class GenreBuilder {
  protected entity: Genre;
  private genrePool: Array<string> = [
    "action",
    "adventure",
    "animation",
    "children",
    "comedy",
    "crime",
    "documentary",
    "drama",
    "fantasy",
    "film-noir",
    "horror",
    "musical",
    "mystery",
    "romance",
    "sci-fi",
    "thriller",
    "war",
    "western",
  ];

  constructor() {
    this.entity = {
      id: randomUUID(),
      name: "action",
    };
  }

  build() {
    return this.entity;
  }

  async save(dao: IGenreDao) {
    return await dao.create(this.entity);
  }

  withUUID(newUUID: string) {
    this.entity.id = newUUID;
    return this;
  }

  withName(name: string) {
    this.entity.name = name;
    return this;
  }

  withRandomName() {
    this.entity.name = this.genrePool[Math.floor(Math.random() * 10)];
    return this;
  }

  requiredForCreation(): GenreCreateInput {
    return {
      name: this.entity.name,
    };
  }
}

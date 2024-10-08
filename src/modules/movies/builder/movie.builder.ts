import { randomUUID } from "crypto";
import type { IMovieRepository } from "../repository";
import type { Movie, MovieCreateInput } from "../types";

export class MovieBuilder {
  protected entity: Movie;

  constructor() {
    this.entity = {
      id: randomUUID(),
      title: "Guardians of the Galaxy",
      description:
        "Adventurer Peter Quill was abducted from Earth as a child in 1988 after his mother died. Fast-forward 26 years into the future: In a galaxy far, far away, Peter is a rogue outlaw who steals a powerful orb he plans to sell.",
      posterUrl:
        "https://image.tmdb.org/t/p/w500/r7vmZjiyZw9rpJMQJdXpjgiCOk9.jpg",
      genreId: randomUUID(),
    };
  }

  build() {
    return this.entity;
  }

  async save(repository: IMovieRepository) {
    return await repository.create(this.entity);
  }

  withGenreId(genreId: string) {
    this.entity.genreId = genreId;
    return this;
  }

  requiredForCreation(): MovieCreateInput {
    return {
      title: this.entity.title,
      description: this.entity.description,
      posterUrl: this.entity.posterUrl,
      genreId: this.entity.genreId,
    };
  }
}

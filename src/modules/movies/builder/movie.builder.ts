import { randomUUID } from "crypto";
import type { IMovieRepository } from "../repository";
import type { Movie, MovieCreateInput } from "../types";
import type { FixedLengthArray } from "modules/_shared/utils/types.util";
import type { IGenreRepository } from "modules/genres/repository";

export class MovieBuilder {
  protected entity: Movie;
  protected entities: Movie[] = [];

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

  buildMany<Length extends number>(
    numberOfMovies: Length,
    genreId: string
  ): Movie[] {
    this.entities = Array.from({ length: numberOfMovies }, () => {
      const movie = new MovieBuilder().withGenreId(genreId).build();
      return movie;
    });

    return this.entities as FixedLengthArray<Movie, Length>;
  }

  async save(repository: IMovieRepository) {
    return await repository.create(this.entity);
  }

  async saveAll(repository: IMovieRepository) {
    const savedMovies = [];
    for (const movie of this.entities) {
      const savedMovie = await repository.create(movie);
      savedMovies.push(savedMovie);
    }
    return savedMovies;
  }

  withUUID(newUUID: string) {
    this.entity.id = newUUID;
    return this;
  }

  withTitle(title: string) {
    this.entity.title = title;
    return this;
  }

  withDescription(description: string) {
    this.entity.description = description;
    return this;
  }

  withPosterUrl(posterUrl: string) {
    this.entity.posterUrl = posterUrl;
    return this;
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

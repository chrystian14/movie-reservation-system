import type { IGenreRepository } from "modules/genres/repository";
import type { IMovieRepository } from "../repository";
import type { Movie, MovieCreateInput, MovieUpdateInput } from "../types";
import type { IMovieService } from "./movie.service.interface";
import { GenreNotFoundError } from "modules/genres/errors";
import { MovieNotFoundError } from "../errors";

export class MovieService implements IMovieService {
  constructor(
    private readonly movieRepository: IMovieRepository,
    private readonly genreRepository: IGenreRepository
  ) {}

  async create(movieCreateInput: MovieCreateInput): Promise<Movie> {
    const genreCount = await this.genreRepository.countById(
      movieCreateInput.genreId
    );

    if (genreCount === 0) {
      throw new GenreNotFoundError();
    }

    return await this.movieRepository.create(movieCreateInput);
  }

  async delete(id: string): Promise<void> {
    const movieCount = await this.movieRepository.countById(id);

    if (movieCount === 0) {
      throw new MovieNotFoundError();
    }

    await this.movieRepository.delete(id);
  }

  async update(id: string, movieUpdateInput: MovieUpdateInput): Promise<Movie> {
    const movieCount = await this.movieRepository.countById(id);

    if (movieCount === 0) {
      throw new MovieNotFoundError();
    }

    if (movieUpdateInput.genreId) {
      const genreCount = await this.genreRepository.countById(
        movieUpdateInput.genreId
      );

      if (genreCount === 0) {
        throw new GenreNotFoundError();
      }
    }

    return await this.movieRepository.update(id, movieUpdateInput);
  }
}

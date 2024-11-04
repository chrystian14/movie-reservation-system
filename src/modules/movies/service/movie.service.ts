import type { IGenreDao } from "modules/genres/dao";
import type { IMovieDao } from "../dao";
import type { Movie, MovieCreateInput, MovieUpdateInput } from "../types";
import type { IMovieService } from "./movie.service.interface";
import { GenreNotFoundError } from "modules/genres/errors";
import { MovieNotFoundError } from "../errors";

export class MovieService implements IMovieService {
  constructor(
    private readonly movieDao: IMovieDao,
    private readonly genreDao: IGenreDao
  ) {}

  async create(movieCreateInput: MovieCreateInput): Promise<Movie> {
    const genreCount = await this.genreDao.countById(movieCreateInput.genreId);

    if (!genreCount) {
      throw new GenreNotFoundError();
    }

    return await this.movieDao.create(movieCreateInput);
  }

  async delete(id: string): Promise<void> {
    const movieCount = await this.movieDao.countById(id);

    if (!movieCount) {
      throw new MovieNotFoundError();
    }

    await this.movieDao.delete(id);
  }

  async update(id: string, movieUpdateInput: MovieUpdateInput): Promise<Movie> {
    const movieCount = await this.movieDao.countById(id);

    if (!movieCount) {
      throw new MovieNotFoundError();
    }

    if (movieUpdateInput.genreId) {
      const genreCount = await this.genreDao.countById(
        movieUpdateInput.genreId
      );

      if (!genreCount) {
        throw new GenreNotFoundError();
      }
    }

    return await this.movieDao.update(id, movieUpdateInput);
  }
}

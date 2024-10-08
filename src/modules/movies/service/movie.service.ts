import type { IGenreRepository } from "modules/genres/repository";
import type { IMovieRepository } from "../repository";
import type { Movie, MovieCreateInput } from "../types";
import type { IMovieService } from "./movie.service.interface";

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
      throw new Error("Genre not found");
    }

    return await this.movieRepository.create(movieCreateInput);
  }
}

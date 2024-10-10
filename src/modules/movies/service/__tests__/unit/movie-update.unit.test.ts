import {
  MovieRepository,
  type IMovieRepository,
} from "modules/movies/repository";
import type { Movie } from "modules/movies/types";
import { MovieService, type IMovieService } from "modules/movies/service";
import { MovieBuilder } from "modules/movies/builder";
import {
  GenreRepository,
  type IGenreRepository,
} from "modules/genres/repository";

jest.mock("modules/movies/repository/movie.repository.ts");
jest.mock("modules/genres/repository/genre.repository.ts");

describe("UNIT: MovieService.update", () => {
  let movieBuilder: MovieBuilder;
  let movieService: IMovieService;
  let movie: Movie;

  let mockedMovieRepository: jest.Mocked<IMovieRepository>;
  let mockedGenreRepository: jest.Mocked<IGenreRepository>;

  beforeEach(() => {
    mockedMovieRepository = jest.mocked(new MovieRepository());
    mockedGenreRepository = jest.mocked(new GenreRepository());

    movieService = new MovieService(
      mockedMovieRepository,
      mockedGenreRepository
    );

    movieBuilder = new MovieBuilder();
    movie = movieBuilder.build();
  });

  test("should throw an error if updating a movie with non-existing id", async () => {
    mockedMovieRepository.countById.mockResolvedValue(0);

    await expect(movieService.delete(movie.id)).rejects.toThrow(
      "Movie not found"
    );

    expect(mockedMovieRepository.countById).toHaveBeenCalledTimes(1);
    expect(mockedMovieRepository.countById).toHaveBeenCalledWith(movie.id);

    expect(mockedMovieRepository.delete).not.toHaveBeenCalled();
  });
});

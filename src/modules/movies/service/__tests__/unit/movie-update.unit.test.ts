import {
  MovieRepository,
  type IMovieRepository,
} from "modules/movies/repository";
import type { Movie, MovieUpdateInput } from "modules/movies/types";
import { MovieService, type IMovieService } from "modules/movies/service";
import { MovieBuilder } from "modules/movies/builder";
import {
  GenreRepository,
  type IGenreRepository,
} from "modules/genres/repository";
import { randomUUID } from "crypto";

jest.mock("modules/movies/repository/movie.repository.ts");
jest.mock("modules/genres/repository/genre.repository.ts");

describe("UNIT: MovieService.update", () => {
  let movieBuilder: MovieBuilder;
  let movieService: IMovieService;
  let movie: Movie;

  let movieUpdateInput: MovieUpdateInput;

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

    movieUpdateInput = {
      title: "Updated title",
      description: "Updated description",
      posterUrl: "Updated posterUrl",
      genreId: randomUUID(),
    };
  });

  test("should throw an error if updating a movie with non-existing id", async () => {
    mockedMovieRepository.countById.mockResolvedValueOnce(0);

    await expect(
      movieService.update(movie.id, movieUpdateInput)
    ).rejects.toThrow("Movie not found");

    expect(mockedMovieRepository.countById).toHaveBeenCalledTimes(1);
    expect(mockedMovieRepository.countById).toHaveBeenCalledWith(movie.id);

    expect(mockedMovieRepository.delete).not.toHaveBeenCalled();
  });

  test("should throw an error if updating a movie with non-existing genre id", async () => {
    mockedMovieRepository.countById.mockResolvedValueOnce(1);
    mockedGenreRepository.countById.mockResolvedValueOnce(0);

    await expect(
      movieService.update(movie.id, movieUpdateInput)
    ).rejects.toThrow("Genre not found");

    expect(mockedGenreRepository.countById).toHaveBeenCalledTimes(1);
    expect(mockedGenreRepository.countById).toHaveBeenCalledWith(
      movieUpdateInput.genreId
    );

    expect(mockedMovieRepository.update).not.toHaveBeenCalled();
  });
});

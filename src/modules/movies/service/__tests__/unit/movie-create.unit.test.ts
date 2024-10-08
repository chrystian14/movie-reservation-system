import {
  MovieRepository,
  type IMovieRepository,
} from "modules/movies/repository";
import type { MovieCreateInput } from "modules/movies/types";
import { MovieService, type IMovieService } from "modules/movies/service";
import { MovieBuilder } from "modules/movies/builder";
import {
  GenreRepository,
  type IGenreRepository,
} from "modules/genres/repository";

jest.mock("modules/movies/repository/movie.repository.ts");
jest.mock("modules/genres/repository/genre.repository.ts");

describe("UNIT: MovieService.create", () => {
  let movieCreateInput: MovieCreateInput;
  let movieService: IMovieService;

  let mockedMovieRepository: jest.Mocked<IMovieRepository>;
  let mockedGenreRepository: jest.Mocked<IGenreRepository>;

  beforeEach(() => {
    mockedMovieRepository = jest.mocked(new MovieRepository());
    mockedGenreRepository = jest.mocked(new GenreRepository());

    movieService = new MovieService(
      mockedMovieRepository,
      mockedGenreRepository
    );

    movieCreateInput = new MovieBuilder().requiredForCreation();
  });

  test("should throw an error if creating a movie with non-existent genre id", async () => {
    mockedGenreRepository.countById.mockResolvedValue(0);

    await expect(movieService.create(movieCreateInput)).rejects.toThrow(
      "Genre not found"
    );

    expect(mockedGenreRepository.countById).toHaveBeenCalledTimes(1);
    expect(mockedGenreRepository.countById).toHaveBeenCalledWith(
      movieCreateInput.genreId
    );

    expect(mockedMovieRepository.create).not.toHaveBeenCalled();
  });
});

import { MovieDao, type IMovieDao } from "modules/movies/dao";
import type { MovieCreateInput } from "modules/movies/types";
import { MovieService, type IMovieService } from "modules/movies/service";
import { MovieBuilder } from "modules/movies/builder";
import { GenreDao, type IGenreDao } from "modules/genres/dao";

jest.mock("modules/movies/dao/movie.dao.ts");
jest.mock("modules/genres/dao/genre.dao.ts");

describe("UNIT: MovieService.create", () => {
  let movieCreateInput: MovieCreateInput;
  let movieService: IMovieService;

  let mockedMovieDao: jest.Mocked<IMovieDao>;
  let mockedGenreDao: jest.Mocked<IGenreDao>;

  beforeEach(() => {
    mockedMovieDao = jest.mocked(new MovieDao());
    mockedGenreDao = jest.mocked(new GenreDao());

    movieService = new MovieService(mockedMovieDao, mockedGenreDao);

    movieCreateInput = new MovieBuilder().requiredForCreation();
  });

  test("should throw an error if creating a movie with non-existent genre id", async () => {
    mockedGenreDao.countById.mockResolvedValueOnce(0);

    await expect(movieService.create(movieCreateInput)).rejects.toThrow(
      "Genre not found"
    );

    expect(mockedGenreDao.countById).toHaveBeenCalledTimes(1);
    expect(mockedGenreDao.countById).toHaveBeenCalledWith(
      movieCreateInput.genreId
    );

    expect(mockedMovieDao.create).not.toHaveBeenCalled();
  });
});

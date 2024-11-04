import { MovieDao, type IMovieDao } from "modules/movies/dao";
import type { Movie } from "modules/movies/types";
import { MovieService, type IMovieService } from "modules/movies/service";
import { MovieBuilder } from "modules/movies/builder";
import { GenreDao, type IGenreDao } from "modules/genres/dao";

jest.mock("modules/movies/dao/movie.dao.ts");
jest.mock("modules/genres/dao/genre.dao.ts");

describe("UNIT: MovieService.delete", () => {
  let movieBuilder: MovieBuilder;
  let movieService: IMovieService;
  let movie: Movie;

  let mockedMovieDao: jest.Mocked<IMovieDao>;
  let mockedGenreDao: jest.Mocked<IGenreDao>;

  beforeEach(() => {
    mockedMovieDao = jest.mocked(new MovieDao());
    mockedGenreDao = jest.mocked(new GenreDao());

    movieService = new MovieService(mockedMovieDao, mockedGenreDao);

    movieBuilder = new MovieBuilder();
    movie = movieBuilder.build();
  });

  test("should throw an error if deleting a movie with non-existing id", async () => {
    mockedMovieDao.countById.mockResolvedValueOnce(0);

    await expect(movieService.delete(movie.id)).rejects.toThrow(
      "Movie not found"
    );

    expect(mockedMovieDao.countById).toHaveBeenCalledTimes(1);
    expect(mockedMovieDao.countById).toHaveBeenCalledWith(movie.id);

    expect(mockedMovieDao.delete).not.toHaveBeenCalled();
  });
});

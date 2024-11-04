import { MovieDao, type IMovieDao } from "modules/movies/dao";
import type { Movie, MovieUpdateInput } from "modules/movies/types";
import { MovieService, type IMovieService } from "modules/movies/service";
import { MovieBuilder } from "modules/movies/builder";
import { GenreDao, type IGenreDao } from "modules/genres/dao";
import { randomUUID } from "crypto";

jest.mock("modules/movies/dao/movie.dao.ts");
jest.mock("modules/genres/dao/genre.dao.ts");

describe("UNIT: MovieService.update", () => {
  let movieBuilder: MovieBuilder;
  let movieService: IMovieService;
  let movie: Movie;

  let movieUpdateInput: MovieUpdateInput;

  let mockedMovieDao: jest.Mocked<IMovieDao>;
  let mockedGenreDao: jest.Mocked<IGenreDao>;

  beforeEach(() => {
    mockedMovieDao = jest.mocked(new MovieDao());
    mockedGenreDao = jest.mocked(new GenreDao());

    movieService = new MovieService(mockedMovieDao, mockedGenreDao);

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
    mockedMovieDao.countById.mockResolvedValueOnce(0);

    await expect(
      movieService.update(movie.id, movieUpdateInput)
    ).rejects.toThrow("Movie not found");

    expect(mockedMovieDao.countById).toHaveBeenCalledTimes(1);
    expect(mockedMovieDao.countById).toHaveBeenCalledWith(movie.id);

    expect(mockedMovieDao.delete).not.toHaveBeenCalled();
  });

  test("should throw an error if updating a movie with non-existing genre id", async () => {
    mockedMovieDao.countById.mockResolvedValueOnce(1);
    mockedGenreDao.countById.mockResolvedValueOnce(0);

    await expect(
      movieService.update(movie.id, movieUpdateInput)
    ).rejects.toThrow("Genre not found");

    expect(mockedGenreDao.countById).toHaveBeenCalledTimes(1);
    expect(mockedGenreDao.countById).toHaveBeenCalledWith(
      movieUpdateInput.genreId
    );

    expect(mockedMovieDao.update).not.toHaveBeenCalled();
  });
});

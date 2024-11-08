import { clearDatabase } from "modules/_shared/tests/clear-database";
import { randomUUID } from "crypto";
import { apiClient } from "modules/_shared/tests";
import { status } from "modules/_shared/utils";
import { generateToken } from "modules/auth/jwt";
import { GenreBuilder } from "modules/genres/builder";
import { GenreDao, type IGenreDao } from "modules/genres/dao";
import type { Genre } from "modules/genres/types";
import { MovieBuilder } from "modules/movies/builder";
import { MovieDao } from "modules/movies/dao";
import { type Movie } from "modules/movies/types";
import { UserBuilder } from "modules/users/builder";
import { UserDao } from "modules/users/dao";

describe("INTEGRATION: MovieController.delete - DEL /api/v1/movies/{id}", () => {
  const movieEndpoint = "/api/v1/movies";

  let movieBuilder: MovieBuilder;
  let movie: Movie;
  let movieDao: MovieDao;

  let genreBuilder: GenreBuilder;
  let genreDao: IGenreDao;
  let createdGenre: Genre;

  let regularUserToken: string;
  let adminUserToken: string;

  beforeEach(async () => {
    await clearDatabase();

    genreDao = new GenreDao();
    genreBuilder = new GenreBuilder();
    createdGenre = await genreBuilder.save(genreDao);

    movieDao = new MovieDao();
    movieBuilder = new MovieBuilder();
    movie = await movieBuilder.withGenreId(createdGenre.id).save(movieDao);

    const userDao = new UserDao();
    const regularUserBuilder = new UserBuilder().withNonAdminRole();
    const regularUser = await regularUserBuilder.save(userDao);
    regularUserToken = generateToken(regularUser);

    const adminUserBuilder = new UserBuilder().withAdminRole();
    const adminUser = await adminUserBuilder.save(userDao);
    adminUserToken = generateToken(adminUser);
  });

  test("should return a 401 when user is not authenticated", async () => {
    const response = await apiClient.delete(`${movieEndpoint}/${movie.id}`);

    const expectedResponseBody = {
      details: "Missing authorization header with bearer token",
    };

    expect(response.statusCode).toBe(status.HTTP_401_UNAUTHORIZED);
    expect(response.body).toEqual(expectedResponseBody);

    const movieCount = await movieDao.countById(movie.id);
    expect(movieCount).toBe(1);
  });

  test("should return a 403 when user is authenticated but not an admin", async () => {
    const response = await apiClient
      .delete(`${movieEndpoint}/${movie.id}`)
      .set("Authorization", `Bearer ${regularUserToken}`);

    const expectedResponseBody = {
      details: "You don't have permission to perform this action",
    };

    expect(response.statusCode).toBe(status.HTTP_403_FORBIDDEN);
    expect(response.body).toEqual(expectedResponseBody);

    const movieCount = await movieDao.countById(movie.id);
    expect(movieCount).toBe(1);
  });

  test("should return a 404 when user is an authenticated admin and trying to delete a movie with non-existing id", async () => {
    const nonExistingId = randomUUID();
    const response = await apiClient
      .delete(`${movieEndpoint}/${nonExistingId}`)
      .set("Authorization", `Bearer ${adminUserToken}`);

    const expectedResponseBody = {
      details: "Movie not found",
    };

    expect(response.statusCode).toBe(status.HTTP_404_NOT_FOUND);
    expect(response.body).toEqual(expectedResponseBody);

    const movieCount = await movieDao.countById(movie.id);
    expect(movieCount).toBe(1);
  });

  test("should delete a movie with valid id and return a 204 when user is authenticated and is an admin", async () => {
    const response = await apiClient
      .delete(`${movieEndpoint}/${movie.id}`)
      .set("Authorization", `Bearer ${adminUserToken}`);

    expect(response.statusCode).toBe(status.HTTP_204_NO_CONTENT);

    const movieCount = await movieDao.countById(movie.id);
    expect(movieCount).toBe(0);
  });
});

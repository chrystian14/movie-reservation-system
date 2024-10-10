import { clearDatabase } from "configs/jest-setup.config";
import { prisma } from "configs/prisma-client.config";
import { apiClient } from "modules/_shared/tests";
import { status } from "modules/_shared/utils";
import { generateToken } from "modules/auth/jwt";
import { GenreBuilder } from "modules/genres/builder";
import {
  GenreRepository,
  type IGenreRepository,
} from "modules/genres/repository";
import type { Genre } from "modules/genres/types";
import { MovieBuilder } from "modules/movies/builder";
import { MovieRepository } from "modules/movies/repository";
import { type Movie } from "modules/movies/types";
import { UserBuilder } from "modules/users/builder";
import { UserRepository } from "modules/users/repository";

describe("INTEGRATION: MovieControler.delete - DEL /api/v1/movies/{id}", () => {
  const movieEndpoint = "/api/v1/movies";

  let movieBuilder: MovieBuilder;
  let movie: Movie;
  let movieRepository: MovieRepository;

  let genreBuilder: GenreBuilder;
  let genreRepository: IGenreRepository;
  let createdGenre: Genre;

  let regularUserToken: string;
  let adminUsertoken: string;

  beforeEach(async () => {
    await clearDatabase();

    genreRepository = new GenreRepository();
    genreBuilder = new GenreBuilder();
    createdGenre = await genreBuilder.save(genreRepository);

    movieRepository = new MovieRepository();
    movieBuilder = new MovieBuilder();
    movie = await movieBuilder
      .withGenreId(createdGenre.id)
      .save(movieRepository);

    const userRepository = new UserRepository();
    const regularUserBuilder = new UserBuilder().withNonAdminRole();
    const regularUser = await regularUserBuilder.save(userRepository);
    regularUserToken = generateToken(regularUser);

    const adminUserBuilder = new UserBuilder().withAdminRole();
    const adminUser = await adminUserBuilder.save(userRepository);
    adminUsertoken = generateToken(adminUser);
  });

  test("should return a 401 when user is not authenticated", async () => {
    const response = await apiClient.delete(`${movieEndpoint}/${movie.id}`);

    const expectedResponseBody = {
      details: "Missing authorization header with bearer token",
    };

    expect(response.statusCode).toBe(status.HTTP_401_UNAUTHORIZED);
    expect(response.body).toEqual(expectedResponseBody);

    const movieCount = await prisma.movie.count();
    expect(movieCount).toBe(0);
  });

  test("should return a 403 when user is authenticated but not an admin", async () => {
    const response = await apiClient.delete(`${movieEndpoint}/${movie.id}`);

    const expectedResponseBody = {
      details: "You don't have permission to perform this action",
    };

    expect(response.statusCode).toBe(status.HTTP_403_FORBIDDEN);
    expect(response.body).toEqual(expectedResponseBody);

    const movieCount = await prisma.movie.count();
    expect(movieCount).toBe(0);
  });
});
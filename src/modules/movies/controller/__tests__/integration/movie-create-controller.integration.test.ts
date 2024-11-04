import { clearDatabase } from "modules/_shared/tests/clear-database";
import { prisma } from "configs/prisma-client.config";
import { randomUUID } from "crypto";
import { apiClient } from "modules/_shared/tests";
import { status } from "modules/_shared/utils";
import { generateToken } from "modules/auth/jwt";
import { GenreBuilder } from "modules/genres/builder";
import { GenreDao, type IGenreDao } from "modules/genres/dao";
import type { Genre } from "modules/genres/types";
import { MovieBuilder } from "modules/movies/builder";
import { type Movie, type MovieCreateInput } from "modules/movies/types";
import { UserBuilder } from "modules/users/builder";
import { UserDao } from "modules/users/dao";

describe("INTEGRATION: MovieControler.create - POST /api/v1/movies", () => {
  const movieEndpoint = "/api/v1/movies";

  let movieBuilder: MovieBuilder;
  let movieWithValidGenre: MovieCreateInput;

  let genreBuilder: GenreBuilder;
  let genreDao: IGenreDao;
  let createdGenre: Genre;

  let regularUserToken: string;
  let adminUserToken: string;

  beforeEach(async () => {
    await clearDatabase();

    genreBuilder = new GenreBuilder();
    genreDao = new GenreDao();
    createdGenre = await genreBuilder.save(genreDao);

    movieBuilder = new MovieBuilder();
    movieWithValidGenre = movieBuilder
      .withGenreId(createdGenre.id)
      .requiredForCreation();

    const userDao = new UserDao();
    const regularUserBuilder = new UserBuilder().withNonAdminRole();
    const regularUser = await regularUserBuilder.save(userDao);
    regularUserToken = generateToken(regularUser);

    const adminUserBuilder = new UserBuilder().withAdminRole();
    const adminUser = await adminUserBuilder.save(userDao);
    adminUserToken = generateToken(adminUser);
  });

  test("should return a 401 when user is not authenticated", async () => {
    const response = await apiClient
      .post(movieEndpoint)
      .send(movieWithValidGenre);

    const expectedResponseBody = {
      details: "Missing authorization header with bearer token",
    };

    expect(response.statusCode).toBe(status.HTTP_401_UNAUTHORIZED);
    expect(response.body).toEqual(expectedResponseBody);

    const movieCount = await prisma.movie.count();
    expect(movieCount).toBe(0);
  });

  test("should return a 403 when user is authenticated but not an admin", async () => {
    const response = await apiClient
      .post(movieEndpoint)
      .set("Authorization", `Bearer ${regularUserToken}`)
      .send(movieWithValidGenre);

    const expectedResponseBody = {
      details: "You don't have permission to perform this action",
    };

    expect(response.statusCode).toBe(status.HTTP_403_FORBIDDEN);
    expect(response.body).toEqual(expectedResponseBody);

    const movieCount = await prisma.movie.count();
    expect(movieCount).toBe(0);
  });

  test("should return an error when creating a movie with admin user but without required fields", async () => {
    const response = await apiClient
      .post(movieEndpoint)
      .set("Authorization", `Bearer ${adminUserToken}`)
      .send({});

    const expectedResponseBody = {
      details: [
        {
          field: ["title"],
          message: "Required",
        },
        {
          field: ["description"],
          message: "Required",
        },
        {
          field: ["posterUrl"],
          message: "Required",
        },
        {
          field: ["genreId"],
          message: "Required",
        },
      ],
    };

    expect(response.status).toBe(status.HTTP_400_BAD_REQUEST);
    expect(response.body).toEqual(expectedResponseBody);

    const movieCount = await prisma.movie.count();
    expect(movieCount).toBe(0);
  });

  test("should return a 404 when creating a movie with non-existent genre id", async () => {
    const movieWithInvalidGenreId = {
      ...movieWithValidGenre,
      genreId: randomUUID(),
    };

    const response = await apiClient
      .post(movieEndpoint)
      .set("Authorization", `Bearer ${adminUserToken}`)
      .send(movieWithInvalidGenreId);

    const expectedResponseBody = {
      details: "Genre not found",
    };

    expect(response.status).toBe(status.HTTP_404_NOT_FOUND);
    expect(response.body).toEqual(expectedResponseBody);

    const movieCount = await prisma.movie.count();
    expect(movieCount).toBe(0);
  });

  test("should create a movie if user is admin", async () => {
    const response = await apiClient
      .post(movieEndpoint)
      .set("Authorization", `Bearer ${adminUserToken}`)
      .send(movieWithValidGenre);

    expect(response.status).toBe(status.HTTP_201_CREATED);

    const expectedResponseBody: Movie = {
      id: expect.any(String),
      title: movieWithValidGenre.title,
      description: movieWithValidGenre.description,
      posterUrl: movieWithValidGenre.posterUrl,
      genreId: movieWithValidGenre.genreId,
    };

    expect(response.body).toStrictEqual(expectedResponseBody);

    const movieCount = await prisma.movie.count();
    expect(movieCount).toBe(1);
  });
});

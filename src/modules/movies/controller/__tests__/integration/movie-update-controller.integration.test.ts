import { clearDatabase } from "modules/_shared/tests/clear-database";
import { randomUUID } from "crypto";
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
import { type Movie, type MovieUpdateInput } from "modules/movies/types";
import { UserBuilder } from "modules/users/builder";
import { UserRepository } from "modules/users/repository";

describe("INTEGRATION: MovieControler.update - PATCH /api/v1/movies/{id}", () => {
  const movieEndpoint = "/api/v1/movies";

  let movieBuilder: MovieBuilder;
  let movie: Movie;
  let movieRepository: MovieRepository;

  let genreBuilder: GenreBuilder;
  let genreRepository: IGenreRepository;
  let createdActionGenre: Genre;
  let createdThrillerGenre: Genre;

  let regularUserToken: string;
  let adminUserToken: string;

  beforeEach(async () => {
    await clearDatabase();

    genreRepository = new GenreRepository();
    genreBuilder = new GenreBuilder();
    genreBuilder.withName("action");
    createdActionGenre = await genreBuilder.save(genreRepository);

    genreBuilder = new GenreBuilder();
    genreBuilder.withName("thriller");
    createdThrillerGenre = await genreBuilder.save(genreRepository);

    movieRepository = new MovieRepository();
    movieBuilder = new MovieBuilder();
    movie = await movieBuilder
      .withGenreId(createdActionGenre.id)
      .save(movieRepository);

    const userRepository = new UserRepository();
    const regularUserBuilder = new UserBuilder().withNonAdminRole();
    const regularUser = await regularUserBuilder.save(userRepository);
    regularUserToken = generateToken(regularUser);

    const adminUserBuilder = new UserBuilder().withAdminRole();
    const adminUser = await adminUserBuilder.save(userRepository);
    adminUserToken = generateToken(adminUser);
  });

  test("should return a 401 when user is not authenticated", async () => {
    const response = await apiClient.patch(`${movieEndpoint}/${movie.id}`);

    const expectedResponseBody = {
      details: "Missing authorization header with bearer token",
    };

    expect(response.statusCode).toBe(status.HTTP_401_UNAUTHORIZED);
    expect(response.body).toEqual(expectedResponseBody);

    const movieCount = await movieRepository.countById(movie.id);
    expect(movieCount).toBe(1);
  });

  test("should return a 403 when user is authenticated but not an admin", async () => {
    const response = await apiClient
      .patch(`${movieEndpoint}/${movie.id}`)
      .set("Authorization", `Bearer ${regularUserToken}`);

    const expectedResponseBody = {
      details: "You don't have permission to perform this action",
    };

    expect(response.statusCode).toBe(status.HTTP_403_FORBIDDEN);
    expect(response.body).toEqual(expectedResponseBody);

    const movieCount = await movieRepository.countById(movie.id);
    expect(movieCount).toBe(1);
  });

  test("should return a 404 when user is an authenticated admin and trying to delete a movie with non-existing id", async () => {
    const nonExistingId = randomUUID();
    const response = await apiClient
      .patch(`${movieEndpoint}/${nonExistingId}`)
      .set("Authorization", `Bearer ${adminUserToken}`);

    const expectedResponseBody = {
      details: "Movie not found",
    };

    expect(response.statusCode).toBe(status.HTTP_404_NOT_FOUND);
    expect(response.body).toEqual(expectedResponseBody);

    const movieCount = await movieRepository.countById(movie.id);
    expect(movieCount).toBe(1);
  });

  test("should update a movie given a valid movie ID and return a 200 status code when the user is an authenticated admin.", async () => {
    const movieUpdateInput: MovieUpdateInput = {
      title: "The Matrix",
      description: "The Matrix is a science fiction movie",
      posterUrl: "https://www.example.com/poster.jpg",
      genreId: createdThrillerGenre.id,
    };

    const response = await apiClient
      .patch(`${movieEndpoint}/${movie.id}`)
      .set("Authorization", `Bearer ${adminUserToken}`)
      .send(movieUpdateInput);

    const expectedResponseBody = {
      id: movie.id,
      title: movieUpdateInput.title,
      description: movieUpdateInput.description,
      posterUrl: movieUpdateInput.posterUrl,
      genreId: createdThrillerGenre.id,
    };

    expect(response.statusCode).toBe(status.HTTP_200_OK);
    expect(expectedResponseBody).toStrictEqual(response.body);
  });

  test("should return a 404 when updating a movie with non-existing genre id", async () => {
    const nonExistingGenreId = randomUUID();
    const movieUpdateInput: MovieUpdateInput = {
      title: "The Matrix",
      description: "The Matrix is a science fiction movie",
      posterUrl: "https://www.example.com/poster.jpg",
      genreId: nonExistingGenreId,
    };

    const response = await apiClient
      .patch(`${movieEndpoint}/${movie.id}`)
      .set("Authorization", `Bearer ${adminUserToken}`)
      .send(movieUpdateInput);

    const expectedResponseBody = {
      details: "Genre not found",
    };

    expect(response.statusCode).toBe(status.HTTP_404_NOT_FOUND);
    expect(response.body).toEqual(expectedResponseBody);
  });

  test("should return a 400 when updating a movie with a title that is longer than 255 characters", async () => {
    const movieUpdateInput: MovieUpdateInput = {
      title: "A".repeat(256),
    };

    const response = await apiClient
      .patch(`${movieEndpoint}/${movie.id}`)
      .set("Authorization", `Bearer ${adminUserToken}`)
      .send(movieUpdateInput);

    const expectedResponseBody = {
      details: [
        {
          field: ["title"],
          message: "String must contain at most 255 character(s)",
        },
      ],
    };

    expect(response.statusCode).toBe(status.HTTP_400_BAD_REQUEST);
    expect(response.body).toStrictEqual(expectedResponseBody);
  });

  test("should return a 400 when updating a movie with a title that is an empty string", async () => {
    const movieUpdateInput: MovieUpdateInput = {
      title: "",
    };

    const response = await apiClient
      .patch(`${movieEndpoint}/${movie.id}`)
      .set("Authorization", `Bearer ${adminUserToken}`)
      .send(movieUpdateInput);

    const expectedResponseBody = {
      details: [
        {
          field: ["title"],
          message: "String must contain at least 1 character(s)",
        },
      ],
    };

    expect(response.statusCode).toBe(status.HTTP_400_BAD_REQUEST);
    expect(response.body).toStrictEqual(expectedResponseBody);
  });

  test("should return a 400 when updating a movie with a description that is longer than 255 characters", async () => {
    const movieUpdateInput: MovieUpdateInput = {
      description: "A".repeat(256),
    };

    const response = await apiClient
      .patch(`${movieEndpoint}/${movie.id}`)
      .set("Authorization", `Bearer ${adminUserToken}`)
      .send(movieUpdateInput);

    const expectedResponseBody = {
      details: [
        {
          field: ["description"],
          message: "String must contain at most 255 character(s)",
        },
      ],
    };

    expect(response.statusCode).toBe(status.HTTP_400_BAD_REQUEST);
    expect(response.body).toStrictEqual(expectedResponseBody);
  });

  test("should return a 400 when updating a movie with a description that is an empty string", async () => {
    const movieUpdateInput: MovieUpdateInput = {
      description: "",
    };

    const response = await apiClient
      .patch(`${movieEndpoint}/${movie.id}`)
      .set("Authorization", `Bearer ${adminUserToken}`)
      .send(movieUpdateInput);

    const expectedResponseBody = {
      details: [
        {
          field: ["description"],
          message: "String must contain at least 1 character(s)",
        },
      ],
    };

    expect(response.statusCode).toBe(status.HTTP_400_BAD_REQUEST);
    expect(response.body).toStrictEqual(expectedResponseBody);
  });
});

import { clearDatabase } from "configs/jest-setup.config";
import { randomUUID } from "crypto";
import { apiClient } from "modules/_shared/tests";
import { status } from "modules/_shared/utils";
import { generateToken } from "modules/auth/jwt";
import { type IGenreRepository } from "modules/genres/repository";
import { GenreBuilder } from "modules/genres/builder";
import { GenreRepository } from "modules/genres/repository";
import { type Genre } from "modules/genres/types";
import { UserBuilder } from "modules/users/builder";
import { UserRepository } from "modules/users/repository";

describe("INTEGRATION: GenreControler.delete - DEL /api/v1/genres/{id}", () => {
  const genreEndpoint = "/api/v1/genres";

  let regularUserToken: string;
  let adminUserToken: string;

  let genreRepository: IGenreRepository;
  let createdGenre: Genre;

  beforeEach(async () => {
    await clearDatabase();

    const userRepository = new UserRepository();
    const regularUser = await new UserBuilder()
      .withNonAdminRole()
      .save(userRepository);
    regularUserToken = generateToken(regularUser);

    const adminUser = await new UserBuilder()
      .withAdminRole()
      .save(userRepository);
    adminUserToken = generateToken(adminUser);

    genreRepository = new GenreRepository();
    createdGenre = await new GenreBuilder().save(genreRepository);
  });

  test("should return a 401 when user is not authenticated", async () => {
    const response = await apiClient.delete(
      `${genreEndpoint}/${createdGenre.id}`
    );

    const expectedResponseBody = {
      details: "Missing authorization header with bearer token",
    };

    expect(response.statusCode).toBe(status.HTTP_401_UNAUTHORIZED);
    expect(response.body).toEqual(expectedResponseBody);

    const genreCount = await genreRepository.countById(createdGenre.id);
    expect(genreCount).toBe(1);
  });

  test("should return a 403 when user is authenticated but not an admin", async () => {
    const response = await apiClient
      .delete(`${genreEndpoint}/${createdGenre.id}`)
      .set("Authorization", `Bearer ${regularUserToken}`);

    const expectedResponseBody = {
      details: "You don't have permission to perform this action",
    };

    expect(response.statusCode).toBe(status.HTTP_403_FORBIDDEN);
    expect(response.body).toEqual(expectedResponseBody);

    const genreCount = await genreRepository.countById(createdGenre.id);
    expect(genreCount).toBe(1);
  });

  test("should return a 404 when user is an authenticated admin and trying to delete a genre with non-existing id", async () => {
    const nonExistingId = randomUUID();
    const response = await apiClient
      .delete(`${genreEndpoint}/${nonExistingId}`)
      .set("Authorization", `Bearer ${adminUserToken}`);

    const expectedResponseBody = {
      details: "Genre not found",
    };

    expect(response.statusCode).toBe(status.HTTP_404_NOT_FOUND);
    expect(response.body).toEqual(expectedResponseBody);

    const genreCount = await genreRepository.countById(createdGenre.id);
    expect(genreCount).toBe(1);
  });

  test("should delete a genre and return 204 when user is admin and id is valid", async () => {
    const response = await apiClient
      .delete(`${genreEndpoint}/${createdGenre.id}`)
      .set("Authorization", `Bearer ${adminUserToken}`);

    expect(response.statusCode).toBe(status.HTTP_204_NO_CONTENT);

    const genreCount = await genreRepository.countById(createdGenre.id);
    expect(genreCount).toBe(0);
  });
});

import { clearDatabase } from "modules/_shared/tests/clear-database";
import { prisma } from "configs/prisma-client.config";
import { apiClient } from "modules/_shared/tests";
import { status } from "modules/_shared/utils";
import { generateToken } from "modules/auth/jwt";
import { GenreBuilder } from "modules/genres/builder";
import { GenreRepository } from "modules/genres/repository";
import type { Genre } from "modules/genres/types";
import { UserBuilder } from "modules/users/builder";
import { UserRepository } from "modules/users/repository";

describe("INTEGRATION: GenreControler.create - POST /api/v1/genres", () => {
  const genreEndpoint = "/api/v1/genres";

  let regularUserToken: string;
  let adminUserToken: string;

  beforeEach(async () => {
    await clearDatabase();

    const userRepository = new UserRepository();
    const regularUserBuilder = new UserBuilder().withNonAdminRole();
    const regularUser = await regularUserBuilder.save(userRepository);
    regularUserToken = generateToken(regularUser);

    const adminUserBuilder = new UserBuilder().withAdminRole();
    const adminUser = await adminUserBuilder.save(userRepository);
    adminUserToken = generateToken(adminUser);
  });

  test("should return a 401 when user is not authenticated", async () => {
    const response = await apiClient.post(genreEndpoint).send({});

    const expectedResponseBody = {
      details: "Missing authorization header with bearer token",
    };

    expect(response.statusCode).toBe(status.HTTP_401_UNAUTHORIZED);
    expect(response.body).toEqual(expectedResponseBody);

    const genreCount = await prisma.genre.count();
    expect(genreCount).toBe(0);
  });

  test("should return a 403 when user is authenticated but not an admin", async () => {
    const response = await apiClient
      .post(genreEndpoint)
      .set("Authorization", `Bearer ${regularUserToken}`)
      .send({});

    const expectedResponseBody = {
      details: "You don't have permission to perform this action",
    };

    expect(response.statusCode).toBe(status.HTTP_403_FORBIDDEN);
    expect(response.body).toEqual(expectedResponseBody);

    const genreCount = await prisma.genre.count();
    expect(genreCount).toBe(0);
  });

  test("should return an error when creating a genre with admin user but without required fields", async () => {
    const response = await apiClient
      .post(genreEndpoint)
      .set("Authorization", `Bearer ${adminUserToken}`)
      .send({});

    const expectedResponseBody = {
      details: [
        {
          field: ["name"],
          message: "Required",
        },
      ],
    };

    expect(response.status).toBe(status.HTTP_400_BAD_REQUEST);
    expect(response.body).toEqual(expectedResponseBody);

    const genreCount = await prisma.genre.count();
    expect(genreCount).toBe(0);
  });

  test("should return a 409 when creating a duplicated genre with admin user", async () => {
    const genreBuilder = new GenreBuilder().withName("action");
    const _createdActionGenre = await genreBuilder.save(new GenreRepository());

    const validGenreCreateInput = genreBuilder.requiredForCreation();

    const response = await apiClient
      .post(genreEndpoint)
      .set("Authorization", `Bearer ${adminUserToken}`)
      .send(validGenreCreateInput);

    const expectedResponseBody = {
      details: "Genre name already exists",
    };

    expect(response.status).toBe(status.HTTP_409_CONFLICT);
    expect(response.body).toEqual(expectedResponseBody);

    const genreCount = await prisma.genre.count();
    expect(genreCount).toBe(1);
  });

  test("should create a genre with lower case name if user is admin", async () => {
    const validGenreCreateInput = new GenreBuilder()
      .withName("aCTiOn")
      .requiredForCreation();

    const response = await apiClient
      .post(genreEndpoint)
      .set("Authorization", `Bearer ${adminUserToken}`)
      .send(validGenreCreateInput);

    expect(response.status).toBe(status.HTTP_201_CREATED);

    const expectedResponseBody: Genre = {
      id: expect.any(String),
      name: validGenreCreateInput.name.toLowerCase(),
    };

    expect(response.body).toStrictEqual(expectedResponseBody);

    const genreCount = await prisma.genre.count();
    expect(genreCount).toBe(1);

    const createdGenre = await prisma.genre.findFirst({
      where: {
        id: response.body.id,
      },
    });

    expect(createdGenre?.name).toBe(expectedResponseBody.name);
  });
});

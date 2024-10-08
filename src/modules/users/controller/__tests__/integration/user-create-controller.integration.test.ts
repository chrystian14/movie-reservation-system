import { clearDatabase } from "configs/jest-setup.config";
import { prisma } from "configs/prisma-client.config";
import { apiClient } from "modules/_shared/tests";
import { status } from "modules/_shared/utils";
import { UserBuilder } from "modules/users/builder";
import { UserRepository, type IUserRepository } from "modules/users/repository";
import { type UserCreateInput } from "modules/users/types";

describe("INTEGRATION: UserControler.create", () => {
  const userEndpoint = "/api/v1/users";

  let userBuilder: UserBuilder;
  let userRepository: IUserRepository;

  let userCreateInput: UserCreateInput;

  beforeEach(async () => {
    await clearDatabase();

    userBuilder = new UserBuilder();
    userRepository = new UserRepository();

    userCreateInput = userBuilder.requiredForCreation();
  });

  afterEach(async () => {
    await clearDatabase();
  });

  test("should create a regular user and return user data without password", async () => {
    const response = await apiClient.post(userEndpoint).send(userCreateInput);

    expect(response.status).toBe(status.HTTP_201_CREATED);
    expect(response.body).not.toHaveProperty("password");

    const expectedResponseBody = {
      id: expect.any(String),
      firstName: userCreateInput.firstName,
      lastName: userCreateInput.lastName,
      email: userCreateInput.email,
      isAdmin: false,
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    };

    expect(response.body).toStrictEqual(expectedResponseBody);

    const userCount = await prisma.user.count();
    expect(userCount).toBe(1);
  });

  test("should return an 409 if email already exists", async () => {
    await userBuilder.save(userRepository);
    const response = await apiClient.post(userEndpoint).send(userCreateInput);

    const expectedResponseBody = {
      details: "Email already exists",
    };

    expect(response.status).toBe(status.HTTP_409_CONFLICT);
    expect(response.body).toStrictEqual(expectedResponseBody);

    const userCount = await prisma.user.count();
    expect(userCount).toBe(1);
  });

  test("should return an error when creating a user without required fields", async () => {
    const response = await apiClient.post(userEndpoint).send({});

    const expectedResponseBody = {
      details: [
        {
          field: ["firstName"],
          message: "Required",
        },
        {
          field: ["lastName"],
          message: "Required",
        },
        {
          field: ["email"],
          message: "Required",
        },
        {
          field: ["password"],
          message: "Required",
        },
      ],
    };

    expect(response.status).toBe(status.HTTP_400_BAD_REQUEST);
    expect(response.body).toStrictEqual(expectedResponseBody);

    const userCount = await prisma.user.count();
    expect(userCount).toBe(0);
  });
});

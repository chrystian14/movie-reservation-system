import { clearDatabase } from "modules/_shared/tests/clear-database";
import { prisma } from "configs/prisma-client.config";
import { apiClient } from "modules/_shared/tests";
import { status } from "modules/_shared/utils";
import { UserBuilder } from "modules/users/builder";
import { UserDao, type IUserDao } from "modules/users/dao";
import { type UserCreateInput } from "modules/users/types";

describe("INTEGRATION: UserController.create", () => {
  const userEndpoint = "/api/v1/users";

  let userBuilder: UserBuilder;
  let userDao: IUserDao;

  let userCreateInput: UserCreateInput;

  beforeEach(async () => {
    await clearDatabase();

    userBuilder = new UserBuilder();
    userDao = new UserDao();

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
    await userBuilder.save(userDao);
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

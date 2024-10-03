import { clearDatabase } from "configs/jest-setup.config";
import { prisma } from "configs/prisma-client.config";
import { apiClient } from "modules/_shared/tests";
import { type UserCreateInput } from "modules/users/types";

describe("INTEGRATION: UserControler.create", () => {
  let userCreateInput: UserCreateInput;
  const userEndpoint = "/api/v1/users";

  beforeEach(async () => {
    await clearDatabase();

    userCreateInput = {
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      password: "johndoepassword",
    };
  });

  afterEach(async () => {
    await clearDatabase();
  });

  test("should create a regular user and return user data without password", async () => {
    const response = await apiClient.post(userEndpoint).send(userCreateInput);

    expect(response.status).toBe(201);
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

  test("should throw an error if email already exists", async () => {
    await prisma.user.create({
      data: userCreateInput,
    });

    const response = await apiClient.post(userEndpoint).send(userCreateInput);

    const expectedResponseBody = {
      message: "Email already exists",
    };

    expect(response.status).toBe(400);
    expect(response.body).toStrictEqual(expectedResponseBody);

    const userCount = await prisma.user.count();
    expect(userCount).toBe(1);
  });
});

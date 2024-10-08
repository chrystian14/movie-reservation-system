import { clearDatabase } from "configs/jest-setup.config";
import { apiClient } from "modules/_shared/tests";
import { status } from "modules/_shared/utils";
import type { LoginInput } from "modules/auth/types";
import { UserBuilder } from "modules/users/builder";
import { UserRepository, type IUserRepository } from "modules/users/repository";

describe("INTEGRATION: AuthController.login - POST /api/v1/login", () => {
  const authEndpoint = "/api/v1/login";

  let userRepository: IUserRepository;
  let userBuilder: UserBuilder;

  let validLoginInput: LoginInput;

  beforeEach(async () => {
    await clearDatabase();

    userRepository = new UserRepository();

    userBuilder = new UserBuilder();
    const userData = userBuilder.build();

    validLoginInput = { email: userData.email, password: userData.password };
    userBuilder.save(userRepository);
  });

  test("should return a 401 if the user email is not found", async () => {
    const response = await apiClient.post(authEndpoint).send({
      email: "email-not-found@test.com",
      password: "password",
    });

    expect(response.status).toBe(status.HTTP_401_UNAUTHORIZED);
    expect(response.body).toStrictEqual({
      details: "Invalid credentials",
    });
  });

  test("should return a 401 if the user password is not correct", async () => {
    const response = await apiClient.post(authEndpoint).send({
      email: validLoginInput.email,
      password: "wrong-password",
    });

    expect(response.status).toBe(status.HTTP_401_UNAUTHORIZED);
    expect(response.body).toStrictEqual({
      details: "Invalid credentials",
    });
  });

  test("should return a 400 if login-in without required fields", async () => {
    const response = await apiClient.post(authEndpoint).send({});

    const expectedResponseBody = {
      details: [
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
  });
});

import { apiClient } from "modules/_shared/tests";
import { clearDatabase } from "modules/_shared/tests/clear-database";
import { status } from "modules/_shared/utils";
import type { LoginInput } from "modules/auth/types";
import { UserBuilder } from "modules/users/builder";
import { UserDao, type IUserDao } from "modules/users/dao";

describe("INTEGRATION: AuthController.login - POST /api/v1/login", () => {
  const authEndpoint = "/api/v1/login";

  let userDao: IUserDao;
  let userBuilder: UserBuilder;

  let validLoginInput: LoginInput;

  beforeEach(async () => {
    await clearDatabase();

    userDao = new UserDao();

    userBuilder = new UserBuilder();
    const userData = userBuilder.build();
    validLoginInput = { email: userData.email, password: userData.password };

    await userBuilder.save(userDao);
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

  test("should return an access token if login-in with valid credentials", async () => {
    const response = await apiClient.post(authEndpoint).send({
      email: validLoginInput.email,
      password: validLoginInput.password,
    });

    expect(response.status).toBe(status.HTTP_200_OK);
    expect(response.body).toHaveProperty("access_token");
  });
});

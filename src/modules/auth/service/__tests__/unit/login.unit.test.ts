import { AuthService } from "modules/auth/service";
import { UserBuilder } from "modules/users/builder";
import { UserRepository, type IUserRepository } from "modules/users/repository";
import * as passwordHashing from "modules/users/utils/password-hashing";
import jwt from "jsonwebtoken";

jest.mock("modules/users/repository/user.repository.ts");

describe("UNIT: AuthService.login", () => {
  let authService: AuthService;
  let mockedUserRepository: jest.Mocked<IUserRepository>;

  beforeEach(async () => {
    mockedUserRepository = jest.mocked(new UserRepository());
    authService = new AuthService(mockedUserRepository);
  });

  test("should throw an error if login-in with non registered email", async () => {
    const nonRegisteredEmailLoginData = {
      email: "non-registered-email@test.com",
      password: "1234567",
    };

    mockedUserRepository.findByEmail.mockResolvedValueOnce(null);

    await expect(
      authService.login(nonRegisteredEmailLoginData)
    ).rejects.toThrow("Invalid credentials");

    expect(mockedUserRepository.findByEmail).toHaveBeenCalledTimes(1);
    expect(mockedUserRepository.findByEmail).toHaveBeenCalledWith(
      nonRegisteredEmailLoginData.email
    );
  });

  test("should throw an error if login-in with non matching password", async () => {
    const mockedUser = new UserBuilder().build();
    mockedUserRepository.findByEmail.mockResolvedValueOnce(mockedUser);

    const comparePasswordSpy = jest
      .spyOn(passwordHashing, "comparePassword")
      .mockResolvedValueOnce(false);

    const nonMatchingPasswordLoginData = {
      email: "registered-email@test.com",
      password: "1234567",
    };

    await expect(
      authService.login(nonMatchingPasswordLoginData)
    ).rejects.toThrow("Invalid credentials");

    expect(mockedUserRepository.findByEmail).toHaveBeenCalledTimes(1);
    expect(mockedUserRepository.findByEmail).toHaveBeenCalledWith(
      nonMatchingPasswordLoginData.email
    );

    expect(comparePasswordSpy).toHaveBeenCalledTimes(1);
    expect(comparePasswordSpy).toHaveBeenCalledWith(
      nonMatchingPasswordLoginData.password,
      mockedUser.password
    );
  });

  test("should return a token with user data and `isAdmin` flag if login-in with matching password", async () => {
    const mockedUser = new UserBuilder().build();

    mockedUserRepository.findByEmail.mockResolvedValueOnce(mockedUser);
    const comparePasswordSpy = jest
      .spyOn(passwordHashing, "comparePassword")
      .mockResolvedValueOnce(true);

    const matchingPasswordLoginData = {
      email: mockedUser.email,
      password: mockedUser.password,
    };

    const token = await authService.login(matchingPasswordLoginData);

    expect(mockedUserRepository.findByEmail).toHaveBeenCalledTimes(1);
    expect(mockedUserRepository.findByEmail).toHaveBeenCalledWith(
      matchingPasswordLoginData.email
    );

    expect(comparePasswordSpy).toHaveBeenCalledTimes(1);
    expect(comparePasswordSpy).toHaveBeenCalledWith(
      matchingPasswordLoginData.password,
      mockedUser.password
    );

    const decodedToken = jwt.decode(token, { json: true });
    const expectedTokenPayloadKeys = ["isAdmin", "sub", "exp", "iat"].sort();

    expect(decodedToken).toBeDefined();
    expect(Object.keys(decodedToken!).sort()).toEqual(expectedTokenPayloadKeys);
  });
});

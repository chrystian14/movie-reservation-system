import { AuthService } from "modules/auth/service";
import { UserRepository, type IUserRepository } from "modules/users/repository";

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

    // jest.spyOn(prisma.user, "findUnique").mockResolvedValueOnce(null);
    mockedUserRepository.findByEmail.mockResolvedValueOnce(null);

    await expect(
      authService.login(nonRegisteredEmailLoginData)
    ).rejects.toThrow("Invalid credentials");

    expect(mockedUserRepository.findByEmail).toHaveBeenCalledTimes(1);
    expect(mockedUserRepository.findByEmail).toHaveBeenCalledWith(
      nonRegisteredEmailLoginData.email
    );
  });
});

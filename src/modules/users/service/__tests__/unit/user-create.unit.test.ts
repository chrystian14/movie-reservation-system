import type { UserCreateInput } from "modules/users/types";
import { UserService } from "modules/users/service";
import { UserRepository, type IUserRepository } from "modules/users/repository";

jest.mock("modules/users/repository/user.repository.ts");

describe("UNIT: UserService.create", () => {
  let userService: UserService;
  let mockedUserRepository: jest.Mocked<IUserRepository>;

  beforeEach(() => {
    mockedUserRepository = jest.mocked(new UserRepository());
    userService = new UserService(mockedUserRepository);
  });

  it("should throw an error if the email already exists", async () => {
    const userCreateInput: UserCreateInput = {
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      password: "password",
    };

    mockedUserRepository.countByEmail.mockResolvedValueOnce(1);

    await expect(userService.create(userCreateInput)).rejects.toThrow(
      "Email already exists"
    );

    expect(mockedUserRepository.countByEmail).toHaveBeenCalledTimes(1);
    expect(mockedUserRepository.countByEmail).toHaveBeenCalledWith(
      userCreateInput.email
    );

    expect(mockedUserRepository.create).not.toHaveBeenCalled();
  });
});

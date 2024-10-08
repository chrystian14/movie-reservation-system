import type { UserCreateInput } from "modules/users/types";
import { UserService, type IUserService } from "modules/users/service";
import { UserRepository, type IUserRepository } from "modules/users/repository";
import { UserBuilder } from "modules/users/builder";

jest.mock("modules/users/repository/user.repository.ts");

describe("UNIT: UserService.create", () => {
  let mockedUserRepository: jest.Mocked<IUserRepository>;
  let userCreateInput: UserCreateInput;

  let userService: IUserService;

  beforeEach(() => {
    mockedUserRepository = jest.mocked(new UserRepository());
    userService = new UserService(mockedUserRepository);

    userCreateInput = new UserBuilder().requiredForCreation();
  });

  test("should throw an error if the email already exists", async () => {
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

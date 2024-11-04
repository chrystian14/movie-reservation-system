import type { UserCreateInput } from "modules/users/types";
import { UserService, type IUserService } from "modules/users/service";
import { UserDao, type IUserDao } from "modules/users/dao";
import { UserBuilder } from "modules/users/builder";

jest.mock("modules/users/dao/user.dao.ts");

describe("UNIT: UserService.create", () => {
  let mockedUserDao: jest.Mocked<IUserDao>;
  let userCreateInput: UserCreateInput;

  let userService: IUserService;

  beforeEach(() => {
    mockedUserDao = jest.mocked(new UserDao());
    userService = new UserService(mockedUserDao);

    userCreateInput = new UserBuilder().requiredForCreation();
  });

  test("should throw an error if the email already exists", async () => {
    mockedUserDao.countByEmail.mockResolvedValueOnce(1);

    await expect(userService.create(userCreateInput)).rejects.toThrow(
      "Email already exists"
    );

    expect(mockedUserDao.countByEmail).toHaveBeenCalledTimes(1);
    expect(mockedUserDao.countByEmail).toHaveBeenCalledWith(
      userCreateInput.email
    );

    expect(mockedUserDao.create).not.toHaveBeenCalled();
  });
});

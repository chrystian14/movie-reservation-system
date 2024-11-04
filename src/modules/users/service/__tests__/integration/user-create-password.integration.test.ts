import { prisma } from "configs/prisma-client.config";
import { clearDatabase } from "modules/_shared/tests/clear-database";
import { type UserCreateInput } from "modules/users/types";
import { UserService, type IUserService } from "modules/users/service";
import { UserDao, type IUserDao } from "modules/users/dao";
import { UserBuilder } from "modules/users/builder";
import { comparePassword } from "modules/users/utils";

describe("INTEGRATION: UserService.create password hash", () => {
  let userDao: IUserDao;
  let userService: IUserService;

  let userCreateInput: UserCreateInput;

  beforeEach(() => {
    userDao = new UserDao();
    userService = new UserService(userDao);

    userCreateInput = new UserBuilder().requiredForCreation();
  });

  afterEach(async () => {
    await clearDatabase();
  });

  test("should create a user with hashed password", async () => {
    const plainPassword = userCreateInput.password;
    await userService.create(userCreateInput);

    const createdUser = await prisma.user.findUnique({
      where: { email: userCreateInput.email },
    });

    expect(createdUser).toBeDefined();
    expect(createdUser?.password).not.toBe(plainPassword);

    const isPasswordMatch = await comparePassword(
      plainPassword,
      createdUser!.password
    );

    expect(isPasswordMatch).toBe(true);
  });

  test("should return user data without password", async () => {
    const createdUser = await userService.create(userCreateInput);

    expect(Object.keys(createdUser)).not.toContain("password");
  });
});

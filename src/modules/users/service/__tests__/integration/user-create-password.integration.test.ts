import { prisma } from "configs/prisma-client.config";
import { clearDatabase } from "configs/jest-setup.config";
import { type UserCreateInput } from "modules/users/types";
import { UserService } from "modules/users/service";
import { UserRepository, type IUserRepository } from "modules/users/repository";
import { UserBuilder } from "modules/users/builder";
import { comparePassword } from "modules/users/utils";

describe("INTEGRATION: UserService.create password hash", () => {
  let userRepository: IUserRepository;
  let userService: UserService;

  let userCreateInput: UserCreateInput;

  beforeEach(() => {
    userRepository = new UserRepository();
    userService = new UserService(userRepository);

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

import { prisma } from "configs/prisma-client.config";
import { clearDatabase } from "configs/jest-setup.config";
import { type UserCreateInput } from "modules/users/types";
import { UserService } from "modules/users/service";
import { UserRepository, type IUserRepository } from "modules/users/repository";

describe("INTEGRATION: UserService.create password hash", () => {
  let userService: UserService;
  let userCreateInput: UserCreateInput;
  let userRepository: IUserRepository;

  beforeEach(() => {
    userRepository = new UserRepository();
    userService = new UserService(userRepository);

    userCreateInput = {
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      password: "password",
    };
  });

  afterEach(async () => {
    await clearDatabase();
  });

  it("should create a user with hashed password", async () => {
    const plainPassword = userCreateInput.password;
    await userService.create(userCreateInput);

    const createdUser = await prisma.user.findUnique({
      where: { email: userCreateInput.email },
    });

    expect(createdUser).toBeDefined();
    expect(createdUser?.password).not.toBe(plainPassword);

    const isPasswordMatch = await UserService.comparePassword(
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

import { clearDatabase } from "../../../../../configs/jest-setup.config";
import { prisma } from "../../../../../configs/prisma-client.config";
import type { UserCreateInput } from "../../../types";
import { UserService } from "../../user.service";

describe("INTEGRATION: UserService.create password hash", () => {
  let userService: UserService;
  let userCreateInput: UserCreateInput;

  beforeEach(() => {
    userService = new UserService();

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

  it("should create a user with a password hash", async () => {
    const plainPassword = userCreateInput.password;
    const user = await userService.create(userCreateInput);

    const createdUser = await prisma.user.findUnique({
      where: { email: userCreateInput.email },
    });

    expect(createdUser).toBeDefined();
    expect(createdUser?.password).not.toBe(plainPassword);

    const isPasswordMatch = await UserService.comparePassword(
      plainPassword,
      createdUser?.password!
    );

    expect(isPasswordMatch).toBe(true);
  });

  test("should return user data without password", async () => {
    const createdUser = await userService.create(userCreateInput);

    expect(Object.keys(createdUser)).not.toContain("password");
  });
});

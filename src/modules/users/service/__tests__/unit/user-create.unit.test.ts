import { prisma } from "../../../../../configs/prisma-client.config";
import { UserCreateInput } from "../../../types";
import { UserService } from "../../user.service";

describe("UNIT: UserService.create", () => {
  let userService: UserService;

  beforeEach(() => {
    userService = new UserService();
  });

  it("should throw an error if the email already exists", async () => {
    const userCreateInput: UserCreateInput = {
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      password: "password",
    };

    const prismaUserCountSpy = jest
      .spyOn(prisma.user, "count")
      .mockResolvedValue(1);

    const prismaUserCreateSpy = jest.spyOn(prisma.user, "create");

    await expect(userService.create(userCreateInput)).rejects.toThrow(
      "Email already exists"
    );

    expect(prismaUserCreateSpy).not.toHaveBeenCalled();
    expect(prismaUserCountSpy).toHaveBeenCalledWith({
      where: { email: userCreateInput.email },
    });
    expect(prismaUserCountSpy).toHaveBeenCalledTimes(1);
  });
});

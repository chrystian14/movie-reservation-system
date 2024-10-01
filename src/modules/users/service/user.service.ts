import { prisma } from "../../../configs/prisma-client.config";
import bcrypt from "bcryptjs";
import { UserCreateInput } from "../types";

export class UserService {
  static hashPassword = async (password: string) => {
    return await bcrypt.hash(password, 10);
  };

  static comparePassword = async (password: string, hashedPassword: string) => {
    return await bcrypt.compare(password, hashedPassword);
  };

  create = async (userCreateInput: UserCreateInput) => {
    const userEmailCount = await prisma.user.count({
      where: { email: userCreateInput.email },
    });

    if (userEmailCount > 0) {
      throw new Error("Email already exists");
    }

    userCreateInput.password = await UserService.hashPassword(
      userCreateInput.password
    );

    const { password, ...userWithoutPassword } = await prisma.user.create({
      data: userCreateInput,
    });

    return userWithoutPassword;
  };
}

import bcrypt from "bcryptjs";
import type { UserCreateInput, UserWithoutPassword } from "../types";
import type { IUserRepository } from "../repository";

export class UserService {
  constructor(private userRepository: IUserRepository) {}

  static hashPassword = async (password: string): Promise<string> => {
    return await bcrypt.hash(password, 10);
  };

  static comparePassword = async (
    password: string,
    hashedPassword: string
  ): Promise<boolean> => {
    return await bcrypt.compare(password, hashedPassword);
  };

  create = async (
    userCreateInput: UserCreateInput
  ): Promise<UserWithoutPassword> => {
    const userEmailCount = await this.userRepository.countByEmail(
      userCreateInput.email
    );

    if (userEmailCount > 0) {
      throw new Error("Email already exists");
    }

    userCreateInput.password = await UserService.hashPassword(
      userCreateInput.password
    );

    const { password, ...userWithoutPassword } =
      await this.userRepository.create(userCreateInput);

    return userWithoutPassword;
  };
}

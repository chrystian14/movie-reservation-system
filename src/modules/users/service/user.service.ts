import bcrypt from "bcryptjs";
import type { UserCreateInput, UserWithoutPassword } from "../types";
import type { IUserRepository } from "../repository";
import type { IUserService } from "./user.service.interface";
import { EmailAlreadyExistsError } from "../errors";
import { userWithoutPasswordSchema } from "../types/schemas";

export class UserService implements IUserService {
  constructor(private userRepository: IUserRepository) {}

  static async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }

  static async comparePassword(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }

  async create(userCreateInput: UserCreateInput): Promise<UserWithoutPassword> {
    const userEmailCount = await this.userRepository.countByEmail(
      userCreateInput.email
    );

    if (userEmailCount > 0) {
      throw new EmailAlreadyExistsError();
    }

    userCreateInput.password = await UserService.hashPassword(
      userCreateInput.password
    );

    const user = await this.userRepository.create(userCreateInput);

    return userWithoutPasswordSchema.parse(user);
  }
}

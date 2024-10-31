import type { UserCreateInput, UserWithoutPassword } from "../types";
import type { IUserRepository } from "../repository";
import type { IUserService } from "./user.service.interface";
import { EmailAlreadyExistsError } from "../errors";
import { userWithoutPasswordSchema } from "../types/schemas";
import { hashPassword } from "../utils";
import { Logger } from "configs/loggers";

export class UserService implements IUserService {
  constructor(private userRepository: IUserRepository) {}

  async create(userCreateInput: UserCreateInput): Promise<UserWithoutPassword> {
    const userEmailCount = await this.userRepository.countByEmail(
      userCreateInput.email
    );

    if (userEmailCount > 0) {
      throw new EmailAlreadyExistsError();
    }

    userCreateInput.password = await hashPassword(userCreateInput.password);

    const user = await this.userRepository.create(userCreateInput);

    Logger.info(`User created with id: ${user.id}`);

    return userWithoutPasswordSchema.parse(user);
  }
}

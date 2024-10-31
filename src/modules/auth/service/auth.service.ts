import type { IUserRepository } from "modules/users/repository";
import type { LoginInput } from "../types";
import { InvalidCredentialsError } from "../errors";
import type { IAuthService } from "./auth.service.interface";
import { comparePassword } from "modules/users/utils";
import { generateToken } from "../jwt/jwt.handlers";
import { Logger } from "configs/loggers";

export class AuthService implements IAuthService {
  constructor(private userRepository: IUserRepository) {}

  async login({ email, password }: LoginInput) {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new InvalidCredentialsError();
    }

    const passwordMatch = await comparePassword(password, user.password);

    if (!passwordMatch) {
      Logger.warn(`Login attempt failed for user id: ${user.id}`);
      throw new InvalidCredentialsError();
    }

    const token = generateToken(user);

    return token;
  }
}

import type { IUserRepository } from "modules/users/repository";
import type { LoginInput } from "../types";
import { InvalidCredentialsError } from "../errors";
import type { IAuthService } from "./auth.service.interface";
import { comparePassword } from "modules/users/utils";

export class AuthService implements IAuthService {
  constructor(private userRepository: IUserRepository) {}

  async login({ email, password }: LoginInput) {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new InvalidCredentialsError();
    }

    const passwordMatch = await comparePassword(password, user.password);

    if (!passwordMatch) {
      throw new InvalidCredentialsError();
    }

    return null;
  }
}

import type { IUserRepository } from "modules/users/repository";
import type { LoginInput } from "../types";
import { InvalidCredentialsError } from "../errors";
import type { IAuthService } from "./auth.service.interface";

export class AuthService implements IAuthService {
  constructor(private userRepository: IUserRepository) {}

  async login(loginData: LoginInput) {
    const user = await this.userRepository.findByEmail(loginData.email);

    if (!user) {
      throw new InvalidCredentialsError();
    }

    return null;
  }
}

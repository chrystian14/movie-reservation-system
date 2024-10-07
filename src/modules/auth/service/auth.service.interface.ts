import type { LoginInput } from "../types";

export interface IAuthService {
  login(loginData: LoginInput): Promise<null>;
}

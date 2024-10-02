import type { UserCreateInput, UserWithoutPassword } from "../types";

export interface IUserService {
  create(userCreateInput: UserCreateInput): Promise<UserWithoutPassword>;
}

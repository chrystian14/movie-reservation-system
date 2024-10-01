import type { User } from "@prisma/client";
import type { UserCreateInput } from "../types";

export interface IUserRepository {
  create(userCreateInput: UserCreateInput): Promise<User>;
  countByEmail(email: string): Promise<number>;
}

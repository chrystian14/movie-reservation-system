import type { User, UserCreateInput } from "../types";

export interface IUserRepository {
  create(userCreateInput: UserCreateInput): Promise<User>;
  countByEmail(email: string): Promise<number>;
  findByEmail(email: string): Promise<User | null>;
}

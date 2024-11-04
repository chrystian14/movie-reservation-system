import type { User, UserCreateInput } from "../types";

export interface IUserDao {
  create(userCreateInput: UserCreateInput): Promise<User>;
  countByEmail(email: string): Promise<number>;
  countById(userId: string): Promise<number>;
  findByEmail(email: string): Promise<User | null>;
}

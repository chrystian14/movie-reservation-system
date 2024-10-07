import type { User, UserCreateInput } from "../types";
import type { IUserRepository } from "./user.repository.interface";
import { prisma } from "configs/prisma-client.config";

export class UserRepository implements IUserRepository {
  async create(userCreateInput: UserCreateInput): Promise<User> {
    return await prisma.user.create({
      data: userCreateInput,
    });
  }

  async countByEmail(email: string): Promise<number> {
    return await prisma.user.count({
      where: { email },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { email },
    });
  }
}

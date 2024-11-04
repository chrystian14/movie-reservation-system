import type { User, UserCreateInput } from "../types";
import type { IUserDao } from "./user.dao.interface";
import { prisma } from "configs/prisma-client.config";

export class UserDao implements IUserDao {
  async create(userCreateInput: UserCreateInput): Promise<User> {
    return await prisma.user.create({
      data: userCreateInput,
    });
  }

  async countById(userId: string): Promise<number> {
    return await prisma.user.count({
      where: { id: userId },
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

import type { User } from "@prisma/client";
import type { UserCreateInput } from "../types";
import type { IUserRepository } from "./user.repository.interface";
import { prisma } from "configs/prisma-client.config";

export class UserRepository implements IUserRepository {
  async create(userCreateInput: UserCreateInput): Promise<User> {
    console.log("#".repeat(20));
    console.log("UserRepository.create CHAMADO!!!");
    console.log("#".repeat(20));

    const user = await prisma.user.create({
      data: userCreateInput,
    });

    return user;
  }

  async countByEmail(email: string): Promise<number> {
    console.log("#".repeat(20));
    console.log("UserRepository.countByEmail CHAMADO!!!");
    console.log("#".repeat(20));

    return await prisma.user.count({
      where: { email },
    });
  }
}

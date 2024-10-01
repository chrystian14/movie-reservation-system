import { User } from "@prisma/client";

export type UserCreateInput = Omit<
  User,
  "id" | "isAdmin" | "createdAt" | "updatedAt"
>;

export type UserWithoutPassword = Omit<User, "password">;

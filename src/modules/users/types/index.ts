import { User } from "@prisma/client";

export type UserCreateInput = Omit<
  User,
  "id" | "isAdmin" | "createdAt" | "updatedAt"
>;

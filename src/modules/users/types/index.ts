import type z from "zod";
import type {
  userCreateInputSchema,
  userSchema,
  userWithoutPasswordSchema,
} from "./schemas";

export type User = z.infer<typeof userSchema>;
export type UserCreateInput = z.infer<typeof userCreateInputSchema>;
export type UserWithoutPassword = z.infer<typeof userWithoutPasswordSchema>;

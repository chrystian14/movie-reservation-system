import { userCreateInputSchema } from "modules/users/types/schemas";
import z from "zod";

export const loginInputSchema = userCreateInputSchema.pick({
  email: true,
  password: true,
});

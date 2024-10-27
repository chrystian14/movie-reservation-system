import { userCreateInputSchema } from "modules/users/types/schemas";

export const loginInputSchema = userCreateInputSchema.pick({
  email: true,
  password: true,
});

import z from "zod";

export const userSchema = z.object({
  id: z.string().uuid(),
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  email: z.string().email().max(255),
  password: z.string().min(6).max(64),
  isAdmin: z.boolean().default(false),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const userCreateInputSchema = userSchema.omit({
  id: true,
  isAdmin: true,
  createdAt: true,
  updatedAt: true,
});

export const userWithoutPasswordSchema = userSchema.omit({
  password: true,
});

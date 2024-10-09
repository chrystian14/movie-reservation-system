import type z from "zod";
import type { loginInputSchema } from "./schemas";
import type { Response } from "express";

export type LoginInput = z.infer<typeof loginInputSchema>;
export type JwtGeneratedTokenPayload = { isAdmin: boolean };

type AuthenticatedResLocals = {
  verifiedToken: string;
};

export type AutheticatedResponse<T = unknown> = Response<
  T,
  AuthenticatedResLocals
>;

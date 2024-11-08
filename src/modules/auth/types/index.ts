import type z from "zod";
import type { loginInputSchema } from "./schemas";
import type { Response } from "express";

export type LoginInput = z.infer<typeof loginInputSchema>;

export type TokenPayload = { isAdmin: boolean; sub: string };

type AuthenticatedResLocals = {
  authenticatedUser: TokenPayload;
};

export type AuthenticatedResponse<T = unknown> = Response<
  T,
  AuthenticatedResLocals
>;

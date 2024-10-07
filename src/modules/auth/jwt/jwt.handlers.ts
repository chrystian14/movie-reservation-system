import jwt from "jsonwebtoken";
import type { JwtGeneratedTokenPayload } from "../types";
import { parsedEnv } from "configs/env.config";

export function generateToken(
  userId: string,
  payload: JwtGeneratedTokenPayload
): string {
  const token = jwt.sign(payload, parsedEnv.JWT_SECRET_KEY, {
    expiresIn: parsedEnv.JWT_EXPIRES_IN,
    subject: userId,
  });

  return token;
}

export function verifyToken(token: string) {
  const decodedJwtPayload = jwt.verify(token, parsedEnv.JWT_SECRET_KEY);

  return decodedJwtPayload;
}

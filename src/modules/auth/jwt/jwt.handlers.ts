import jwt from "jsonwebtoken";
import type { JwtGeneratedTokenPayload } from "../types";
import { parsedEnv } from "configs/env.config";
import type { User } from "modules/users/types";

export function generateToken(user: User): string {
  const jwtPayload: JwtGeneratedTokenPayload = { isAdmin: user.isAdmin };

  const token = jwt.sign(jwtPayload, parsedEnv.JWT_SECRET_KEY, {
    expiresIn: parsedEnv.JWT_EXPIRES_IN,
    subject: user.id,
  });

  return token;
}

export function verifyToken(token: string) {
  const decodedJwtPayload = jwt.verify(token, parsedEnv.JWT_SECRET_KEY);

  return decodedJwtPayload;
}

import jwt from "jsonwebtoken";
import type { TokenPayload } from "../types";
import { parsedEnv } from "configs/env.config";
import type { User } from "modules/users/types";

export function generateToken(user: User): string {
  const tokenPayload: TokenPayload = { isAdmin: user.isAdmin };

  const token = jwt.sign(tokenPayload, parsedEnv.JWT_SECRET_KEY, {
    expiresIn: parsedEnv.JWT_EXPIRES_IN,
    subject: user.id,
  });

  return token;
}

export function verifyToken(token: string) {
  const decodedTokenPayload = <TokenPayload>(
    jwt.verify(token, parsedEnv.JWT_SECRET_KEY)
  );

  return decodedTokenPayload;
}

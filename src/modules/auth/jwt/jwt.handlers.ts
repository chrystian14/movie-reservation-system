import jwt from "jsonwebtoken";
import type { JwtGeneratedTokenPayload } from "../types";

export function generateToken(
  userId: string,
  payload: JwtGeneratedTokenPayload
): string {
  const token = jwt.sign(payload, process.env.JWT_SECRET_KEY!, {
    expiresIn: process.env.JWT_EXPIRES_IN!,
    subject: userId,
  });

  return token;
}

export function verifyToken(token: string) {
  const decodedJwtPayload = jwt.verify(token, process.env.JWT_SECRET_KEY!);

  return decodedJwtPayload;
}

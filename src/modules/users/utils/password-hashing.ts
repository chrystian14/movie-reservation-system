import bcrypt from "bcryptjs";

export async function hashPassword(rawPassword: string): Promise<string> {
  return await bcrypt.hash(rawPassword, 10);
}

export async function comparePassword(
  rawPassword: string,
  hashedPassword: string
): Promise<boolean> {
  return await bcrypt.compare(rawPassword, hashedPassword);
}

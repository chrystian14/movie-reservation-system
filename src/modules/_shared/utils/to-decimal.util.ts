import { Prisma } from "@prisma/client";

export function toDecimal(value: number | string) {
  return new Prisma.Decimal(value);
}

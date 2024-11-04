import { clearDatabase } from "modules/_shared/tests/clear-database";
import { prisma } from "./prisma-client.config";
import * as matchers from "jest-extended";
expect.extend(matchers);

// export async function clearDatabase() {
//   console.log("#".repeat(20));
//   console.log("clearDatabase EXECUTED");
//   console.log("#".repeat(20));

//   await prisma.reservation.deleteMany();
//   await prisma.user.deleteMany();
//   await prisma.showtime.deleteMany();
//   await prisma.movie.deleteMany();
//   await prisma.genre.deleteMany();
//   await prisma.seat.deleteMany();
//   await prisma.room.deleteMany();
// }

afterAll(async () => {
  jest.restoreAllMocks();

  await clearDatabase();
  await prisma.$disconnect();
});

beforeAll(async () => {
  await clearDatabase();
});

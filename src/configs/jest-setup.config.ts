import { prisma } from "./prisma-client.config";

export async function clearDatabase() {
  await prisma.user.deleteMany();
  await prisma.showtime.deleteMany();
  await prisma.movie.deleteMany();
  await prisma.genre.deleteMany();
  await prisma.seat.deleteMany();
  await prisma.room.deleteMany();
}

afterAll(async () => {
  jest.restoreAllMocks();

  await clearDatabase();
  await prisma.$disconnect();
});

beforeAll(async () => {
  await clearDatabase();
});

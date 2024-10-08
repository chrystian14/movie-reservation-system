import { prisma } from "./prisma-client.config";

export async function clearDatabase() {
  await prisma.user.deleteMany();
  await prisma.movie.deleteMany();
  await prisma.genre.deleteMany();
}

afterAll(async () => {
  jest.restoreAllMocks();

  await clearDatabase();
  await prisma.$disconnect();
});

beforeAll(async () => {
  await clearDatabase();
});

import { prisma } from "./prisma-client.config";

export async function clearDatabase() {
  await prisma.user.deleteMany();
}

afterAll(async () => {
  jest.restoreAllMocks();

  await clearDatabase();
  await prisma.$disconnect();
});

beforeAll(async () => {
  await clearDatabase();
});

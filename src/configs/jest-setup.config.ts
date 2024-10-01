import { prisma } from "./prisma-client.config";
import { app } from "../app";
import supertest from "supertest";

export async function clearDatabase() {
  await prisma.user.deleteMany();
}

afterAll(async () => {
  await clearDatabase();
  await prisma.$disconnect();
});

beforeAll(async () => {
  await clearDatabase();
});

export const apiClient = supertest(app);

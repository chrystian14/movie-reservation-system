import { prisma } from "./prisma-client.config";
import { app } from "../app";
import supertest from "supertest";

afterAll(async () => {
  await prisma.$disconnect();
});

beforeAll(async () => {
  await prisma.user.deleteMany();
});

export const apiClient = supertest(app);

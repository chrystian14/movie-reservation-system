import { prisma } from "configs/prisma-client.config";

export async function clearDatabase() {
  await prisma.reservation.deleteMany();
  await prisma.user.deleteMany();
  await prisma.showtime.deleteMany();
  await prisma.movie.deleteMany();
  await prisma.genre.deleteMany();
  await prisma.seat.deleteMany();
  await prisma.room.deleteMany();
}

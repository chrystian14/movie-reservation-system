import type { Showtime, ShowtimeCreateInput } from "../types";
import type { IShowtimeRepository } from "./showtime.repository.interface";
import { prisma } from "configs/prisma-client.config";

export class ShowtimeRepository implements IShowtimeRepository {
  async create(showtimeCreateInput: ShowtimeCreateInput): Promise<Showtime> {
    return await prisma.showtime.create({
      data: showtimeCreateInput,
    });
  }

  async list(): Promise<Array<Showtime>> {
    return await prisma.showtime.findMany();
  }

  async listByDate(startDate: Date, endDate: Date): Promise<Array<Showtime>> {
    return await prisma.showtime.findMany({
      where: {
        datetime: {
          gte: startDate,
          lt: endDate,
        },
      },
    });
  }

  async count(): Promise<number> {
    return await prisma.showtime.count();
  }

  async countById(showtimeId: string): Promise<number> {
    return await prisma.showtime.count({ where: { id: showtimeId } });
  }

  async findById(showtimeId: string): Promise<Showtime | null> {
    return await prisma.showtime.findUnique({
      where: { id: showtimeId },
    });
  }
}

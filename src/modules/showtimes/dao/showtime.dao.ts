import type { Showtime, ShowtimeCreateInput } from "../types";
import type { IShowtimeDao } from "./showtime.dao.interface";
import { prisma } from "configs/prisma-client.config";

export class ShowtimeDao implements IShowtimeDao {
  async create(showtimeCreateInput: ShowtimeCreateInput): Promise<Showtime> {
    return await prisma.showtime.create({
      data: showtimeCreateInput,
    });
  }

  async list(page: number, perPage: number): Promise<Array<Showtime>> {
    return await prisma.showtime.findMany({
      skip: (page - 1) * perPage,
      take: perPage,
      orderBy: {
        datetime: "desc",
      },
    });
  }

  async listByDate(
    startDate: Date,
    endDate: Date,
    page: number,
    perPage: number
  ): Promise<Array<Showtime>> {
    return await prisma.showtime.findMany({
      where: {
        datetime: {
          gte: startDate,
          lt: endDate,
        },
      },
      skip: (page - 1) * perPage,
      take: perPage,
      orderBy: {
        datetime: "desc",
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

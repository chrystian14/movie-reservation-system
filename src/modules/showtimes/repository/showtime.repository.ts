import type { Showtime, ShowtimeCreateInput } from "../types";
import type { IShowtimeRepository } from "./showtime.repository.interface";
import { prisma } from "configs/prisma-client.config";

export class ShowtimeRepository implements IShowtimeRepository {
  async create(showtimeCreateInput: ShowtimeCreateInput): Promise<Showtime> {
    return await prisma.showtime.create({
      data: showtimeCreateInput,
    });
  }

  async count(): Promise<number> {
    return await prisma.showtime.count();
  }
}

import type { Seat, SeatCreateInput } from "../types";
import type { ISeatRepository } from "./seat.repository.interface";
import { prisma } from "configs/prisma-client.config";

export class SeatRepository implements ISeatRepository {
  async create(seatCreateInput: SeatCreateInput): Promise<Seat> {
    return await prisma.seat.create({
      data: seatCreateInput,
    });
  }

  async countByRoomId(roomId: string): Promise<number> {
    return await prisma.seat.count({
      where: { roomId },
    });
  }

  async getAvailableSeats(showtimeId: string): Promise<Array<Seat>> {
    return await prisma.seat.findMany({
      where: {
        room: {
          showtimes: {
            some: {
              id: showtimeId,
            },
          },
        },
      },
    });
  }
}

import { ReservationStatus } from "@prisma/client";
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

  async getAllSeatsByShowtimeId(showtimeId: string): Promise<Array<Seat>> {
    return await prisma.seat.findMany({
      where: {
        reservations: {
          none: {
            showtimeId,
            status: ReservationStatus.CONFIRMED,
          },
        },
      },
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
        reservations: {
          none: {
            showtimeId,
            status: ReservationStatus.CONFIRMED,
          },
        },
      },
    });
  }

  async scanForReservedSeatsByShowtimeId(
    seatIdsToScan: Array<string>,
    showtimeId: string
  ): Promise<Array<string>> {
    const reservedSeats = await prisma.seat.findMany({
      where: {
        id: { in: seatIdsToScan },
        reservations: {
          some: {
            showtimeId: showtimeId,
            status: ReservationStatus.CONFIRMED,
          },
        },
      },
      select: {
        id: true,
      },
    });

    return reservedSeats.map((seat) => seat.id);
  }
}

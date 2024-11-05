import { ReservationStatus } from "@prisma/client";
import type { Seat, SeatCreateInput } from "../types";
import type { ISeatDao } from "./seat.dao.interface";
import { prisma } from "configs/prisma-client.config";

export class SeatDao implements ISeatDao {
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

  async count(): Promise<number> {
    return await prisma.seat.count();
  }

  async countByColumnAndRowByRoomId(
    column: string,
    row: number,
    roomId: string
  ): Promise<number> {
    return await prisma.seat.count({
      where: { column, row, roomId },
    });
  }

  async scanForSeatsInRoom(
    roomId: string,
    seatIds: Array<string>
  ): Promise<Seat[]> {
    const seats = await prisma.seat.findMany({
      where: { id: { in: seatIds }, roomId: roomId },
    });

    return seats;
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

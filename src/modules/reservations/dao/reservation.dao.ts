import { ReservationStatus } from "@prisma/client";
import type { Reservation, ReservationCreateInput } from "../types";
import type { IReservationDao } from "./reservation.dao.interface";
import { prisma } from "configs/prisma-client.config";

export class ReservationDao implements IReservationDao {
  async count(): Promise<number> {
    return await prisma.reservation.count();
  }

  async list(): Promise<Array<Reservation>> {
    return await prisma.reservation.findMany();
  }

  async findById(reservationId: string): Promise<Reservation | null> {
    return await prisma.reservation.findUnique({
      where: {
        id: reservationId,
      },
    });
  }

  async cancel(reservationId: string): Promise<void> {
    await prisma.reservation.update({
      where: {
        id: reservationId,
      },
      data: {
        status: ReservationStatus.CANCELLED,
      },
    });
  }

  async listByUserId(
    userId: string,
    reservationStatus: ReservationStatus
  ): Promise<Array<Reservation>> {
    return await prisma.reservation.findMany({
      where: {
        userId: userId,
        status: reservationStatus,
      },
    });
  }

  async create(
    reservationCreateInput: ReservationCreateInput
  ): Promise<Array<Reservation>> {
    return await prisma.reservation.createManyAndReturn({
      data: reservationCreateInput.seatIds.map((seatId) => {
        return {
          showtimeId: reservationCreateInput.showtimeId,
          userId: reservationCreateInput.userId,
          status: ReservationStatus.CONFIRMED,
          amountPaid: reservationCreateInput.amountPaid,
          seatId: seatId,
        };
      }),
    });
  }
}

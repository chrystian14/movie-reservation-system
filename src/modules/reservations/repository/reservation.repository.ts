import { ReservationStatus } from "@prisma/client";
import type { Reservation, ReservationCreateInput } from "../types";
import type { IReservationRepository } from "./reservation.repository.interface";
import { prisma } from "configs/prisma-client.config";

export class ReservationRepository implements IReservationRepository {
  async count(): Promise<number> {
    return await prisma.reservation.count();
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

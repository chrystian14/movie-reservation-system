import type { ReservationStatus } from "@prisma/client";
import type { Reservation, ReservationCreateInput } from "../types";

export interface IReservationDao {
  cancel(reservationId: string): Promise<void>;
  create(
    reservationCreateInput: ReservationCreateInput
  ): Promise<Array<Reservation>>;
  list(): Promise<Array<Reservation>>;
  listByUserId(
    userId: string,
    reservationStatus: ReservationStatus
  ): Promise<Array<Reservation>>;
  count(): Promise<number>;
  findById(reservationId: string): Promise<Reservation | null>;
}

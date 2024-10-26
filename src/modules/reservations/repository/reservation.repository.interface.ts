import type { ReservationStatus } from "@prisma/client";
import type { Reservation, ReservationCreateInput } from "../types";

export interface IReservationRepository {
  create(
    reservationCreateInput: ReservationCreateInput
  ): Promise<Array<Reservation>>;
  listByUserId(
    userId: string,
    reservationStatus: ReservationStatus
  ): Promise<Array<Reservation>>;
  count(): Promise<number>;
}

import type { ReservationCreateInput, Reservation } from "../types";

export interface IReservationService {
  listByUserId(userId: string): Promise<Array<Reservation>>;
  create(
    reservationCreateInput: ReservationCreateInput
  ): Promise<Array<Reservation>>;
}

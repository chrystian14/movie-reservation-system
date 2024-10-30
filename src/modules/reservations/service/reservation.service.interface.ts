import type { ReservationCreateInput, Reservation } from "../types";

export interface IReservationService {
  cancel(reservationId: string, userId: string): Promise<void>;
  list(): Promise<Array<Reservation>>;
  listByUserId(userId: string): Promise<Array<Reservation>>;
  create(
    reservationCreateInput: ReservationCreateInput
  ): Promise<Array<Reservation>>;
}

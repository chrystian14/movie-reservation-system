import type { ReservationCreateInput, Reservation } from "../types";

export interface IReservationService {
  create(
    reservationCreateInput: ReservationCreateInput
  ): Promise<Array<Reservation>>;
}

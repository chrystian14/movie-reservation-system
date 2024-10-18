import type { Reservation, ReservationCreateInput } from "../types";

export interface IReservationRepository {
  create(
    reservationCreateInput: ReservationCreateInput
  ): Promise<Array<Reservation>>;
  count(): Promise<number>;
}

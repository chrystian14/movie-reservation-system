import type { SeatCreateInput, Seat } from "../types";

export interface ISeatService {
  create(seatCreateInput: SeatCreateInput): Promise<Seat>;
}

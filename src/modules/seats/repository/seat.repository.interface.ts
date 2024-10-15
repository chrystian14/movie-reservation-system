import type { Seat, SeatCreateInput } from "../types";

export interface ISeatRepository {
  create(movieCreateInput: SeatCreateInput): Promise<Seat>;
}

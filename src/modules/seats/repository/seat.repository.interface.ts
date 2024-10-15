import type { Seat, SeatCreateInput } from "../types";

export interface ISeatRepository {
  create(seatCreateInput: SeatCreateInput): Promise<Seat>;
  countByRoomId(roomId: string): Promise<number>;
}

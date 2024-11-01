import type { Seat, SeatCreateInput } from "../types";

export interface ISeatRepository {
  create(seatCreateInput: SeatCreateInput): Promise<Seat>;
  countByRoomId(roomId: string): Promise<number>;
  getAllSeatsByShowtimeId(showtimeId: string): Promise<Array<Seat>>;
  getAvailableSeats(showtimeId: string): Promise<Array<Seat>>;
  scanForSeatsInRoom(roomId: string, seatIds: Array<string>): Promise<Seat[]>;
  scanForReservedSeatsByShowtimeId(
    seatIdsToScan: Array<string>,
    showtimeId: string
  ): Promise<Array<string>>;
}

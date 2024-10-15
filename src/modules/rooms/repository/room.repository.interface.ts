import type { SeatWithoutRoomId } from "modules/seats/types";
import type { Room, RoomCreateInput } from "../types";

export interface IRoomRepository {
  create(roomCreateInput: RoomCreateInput): Promise<Room>;
  createWithSeats(
    roomCreateInput: RoomCreateInput,
    seats: Array<SeatWithoutRoomId>
  ): Promise<Room>;
  countById(id: string): Promise<number>;
  count(): Promise<number>;
  delete(id: string): Promise<void>;
}

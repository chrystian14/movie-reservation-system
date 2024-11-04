import type { SeatWithoutRoomId } from "modules/seats/types";
import type { Room, RoomCreateInput } from "../types";

export interface IRoomDao {
  create(roomCreateInput: RoomCreateInput): Promise<Room>;
  countById(id: string): Promise<number>;
  count(): Promise<number>;
  delete(id: string): Promise<void>;
}

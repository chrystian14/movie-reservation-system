import type { RoomCreateInput, Room } from "../types";

export interface IRoomService {
  create(roomCreateInput: RoomCreateInput): Promise<Room>;
}

import type { RoomCreateInput, Room } from "../types";

export interface IRoomService {
  create(movieCreateInput: RoomCreateInput): Promise<Room>;
}

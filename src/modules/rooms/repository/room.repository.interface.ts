import type { Room, RoomCreateInput } from "../types";

export interface IRoomRepository {
  create(roomCreateInput: RoomCreateInput): Promise<Room>;
  countById(id: string): Promise<number>;
  delete(id: string): Promise<void>;
}

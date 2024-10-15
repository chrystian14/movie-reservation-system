import type { Room, RoomCreateInput } from "../types";

export interface IRoomRepository {
  create(movieCreateInput: RoomCreateInput): Promise<Room>;
  countById(id: string): Promise<number>;
  delete(id: string): Promise<void>;
}

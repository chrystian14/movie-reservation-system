import type { IRoomRepository } from "../repository";
import type { Room, RoomCreateInput } from "../types";
import type { IRoomService } from "./room.service.interface";

export class RoomService implements IRoomService {
  constructor(private readonly roomRepository: IRoomRepository) {}

  async create(roomCreateInput: RoomCreateInput): Promise<Room> {
    return await this.roomRepository.create(roomCreateInput);
  }
}

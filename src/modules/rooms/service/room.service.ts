import type { IRoomRepository } from "../repository";
import type { Room, RoomCreateInput } from "../types";
import type { IRoomService } from "./room.service.interface";
import { Logger } from "configs/loggers";

export class RoomService implements IRoomService {
  constructor(private readonly roomRepository: IRoomRepository) {}

  async create(roomCreateInput: RoomCreateInput): Promise<Room> {
    const room = await this.roomRepository.create(roomCreateInput);

    Logger.info(`created room with id: ${room.id}`);

    return room;
  }
}

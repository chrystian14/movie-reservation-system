import type { IRoomDao } from "../dao";
import type { Room, RoomCreateInput } from "../types";
import type { IRoomService } from "./room.service.interface";
import { Logger } from "configs/loggers";

export class RoomService implements IRoomService {
  constructor(private readonly roomDao: IRoomDao) {}

  async create(roomCreateInput: RoomCreateInput): Promise<Room> {
    const room = await this.roomDao.create(roomCreateInput);

    Logger.info(`created room with id: ${room.id}`);

    return room;
  }
}

import type { IRoomDao } from "modules/rooms/dao";
import type { ISeatDao } from "../dao";
import type { Seat, SeatCreateInput } from "../types";
import type { ISeatService } from "./seat.service.interface";
import { RoomNotFoundError } from "modules/rooms/errors";

export class SeatService implements ISeatService {
  constructor(
    private readonly seatDao: ISeatDao,
    private readonly roomDao: IRoomDao
  ) {}

  async create(seatCreateInput: SeatCreateInput): Promise<Seat> {
    const roomCount = await this.roomDao.countById(seatCreateInput.roomId);

    if (roomCount === 0) {
      throw new RoomNotFoundError();
    }

    return await this.seatDao.create(seatCreateInput);
  }
}

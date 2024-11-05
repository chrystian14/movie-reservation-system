import type { IRoomDao } from "modules/rooms/dao";
import type { ISeatDao } from "../dao";
import type { Seat, SeatCreateInput } from "../types";
import type { ISeatService } from "./seat.service.interface";
import { RoomNotFoundError } from "modules/rooms/errors";
import { SeatColumnRowAlreadyTaken } from "../errors/seat.errors";

export class SeatService implements ISeatService {
  constructor(
    private readonly seatDao: ISeatDao,
    private readonly roomDao: IRoomDao
  ) {}

  async create(seatCreateInput: SeatCreateInput): Promise<Seat> {
    const roomCount = await this.roomDao.countById(seatCreateInput.roomId);

    if (!roomCount) {
      throw new RoomNotFoundError();
    }

    const seatColumnAndRowAlreadyTaken =
      await this.seatDao.countByColumnAndRowByRoomId(
        seatCreateInput.column,
        seatCreateInput.row,
        seatCreateInput.roomId
      );

    if (seatColumnAndRowAlreadyTaken) {
      throw new SeatColumnRowAlreadyTaken();
    }

    return await this.seatDao.create(seatCreateInput);
  }
}

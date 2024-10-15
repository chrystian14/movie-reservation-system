import type { IRoomRepository } from "modules/rooms/repository";
import type { ISeatRepository } from "../repository";
import type { Seat, SeatCreateInput } from "../types";
import type { ISeatService } from "./seat.service.interface";
import { RoomNotFoundError } from "modules/rooms/errors";

export class SeatService implements ISeatService {
  constructor(
    private readonly seatRepository: ISeatRepository,
    private readonly roomRepository: IRoomRepository
  ) {}

  async create(seatCreateInput: SeatCreateInput): Promise<Seat> {
    const roomCount = await this.roomRepository.countById(
      seatCreateInput.roomId
    );

    if (roomCount === 0) {
      throw new RoomNotFoundError();
    }

    return await this.seatRepository.create(seatCreateInput);
  }
}

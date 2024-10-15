import type { IRoomRepository } from "modules/rooms/repository";
import type { ISeatRepository } from "../repository";
import type { Seat, SeatCreateInput } from "../types";
import type { ISeatService } from "./seat.service.interface";

export class SeatService implements ISeatService {
  constructor(
    private readonly seatRepository: ISeatRepository,
    private readonly roomRepository: IRoomRepository
  ) {}

  async create(seatCreateInput: SeatCreateInput): Promise<Seat> {
    return await this.seatRepository.create(seatCreateInput);
  }
}

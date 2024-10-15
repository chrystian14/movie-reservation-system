import type { SeatWithoutRoomId } from "modules/seats/types";
import type { IRoomRepository } from "../repository";
import type { Room, RoomCreateInput } from "../types";
import type { IRoomService } from "./room.service.interface";

export class RoomService implements IRoomService {
  constructor(private readonly roomRepository: IRoomRepository) {}

  async create(roomCreateInput: RoomCreateInput): Promise<Room> {
    const seats: Array<SeatWithoutRoomId> = [];

    for (let row = 0; row < roomCreateInput.rows; row++) {
      for (let column = 0; column < roomCreateInput.columns; column++) {
        const currentSeat: SeatWithoutRoomId = {
          column: String.fromCharCode(97 + column),
          row: row + 1,
          price: roomCreateInput.baseSeatPrice,
        };

        seats.push(currentSeat);
      }
    }

    return await this.roomRepository.createWithSeats(roomCreateInput, seats);
  }
}

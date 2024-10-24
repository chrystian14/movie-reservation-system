import type { SeatWithoutRoomId } from "modules/seats/types";
import type { Room, RoomCreateInput } from "../types";
import type { IRoomRepository } from "./room.repository.interface";
import { prisma } from "configs/prisma-client.config";

export class RoomRepository implements IRoomRepository {
  async create(roomCreateInput: RoomCreateInput): Promise<Room> {
    return await prisma.room.create({
      data: roomCreateInput,
    });
  }

  async createWithSeats(
    roomCreateInput: RoomCreateInput,
    seats: Array<SeatWithoutRoomId>
  ): Promise<Room> {
    return await prisma.room.create({
      data: { ...roomCreateInput, seats: { create: seats } },
    });
  }

  async count(): Promise<number> {
    return await prisma.room.count();
  }

  async countById(id: string): Promise<number> {
    return await prisma.room.count({
      where: { id },
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.room.delete({
      where: { id },
    });
  }
}

import { randomUUID } from "crypto";
import type { IRoomRepository } from "../repository";
import type { Room, RoomAndSeats, RoomCreateInput } from "../types";
import { Chance } from "chance";
import { Prisma } from "@prisma/client";
import type { Seat } from "modules/seats/types";
import type { ISeatRepository } from "modules/seats/repository";
import type { FixedLengthArray } from "modules/_shared/utils/types.util";
import { number } from "zod";
import { SeatBuilder } from "modules/seats/builder";

export class RoomBuilder {
  protected entity: Room;
  protected entities: Room[] = [];
  protected chance: Chance.Chance;
  protected seats: Seat[] = [];

  constructor() {
    this.chance = new Chance();

    this.entity = {
      id: randomUUID(),
      name: this.chance.word({ length: 10 }),
      number: this.chance.integer({ min: 1, max: 100 }),
    };
  }

  build() {
    return this.entity;
  }

  async save(
    roomRepository: IRoomRepository,
    seatRepository: ISeatRepository
  ): Promise<RoomAndSeats> {
    const savedRoom = await roomRepository.create(this.entity);
    const savedSeats: Seat[] = [];
    for (const seat of this.seats) {
      const savedSeat = await seatRepository.create(seat);
      savedSeats.push(savedSeat);
    }

    return {
      room: savedRoom,
      seats: savedSeats,
    };
  }

  withUUID(newUUID: string) {
    this.entity.id = newUUID;
    return this;
  }

  requiredForCreation(): RoomCreateInput {
    return {
      name: this.entity.name,
      number: this.entity.number,
    };
  }

  generateSeats(columns: number, rows: number, seatPrice?: number) {
    for (let i = 0; i < columns; i++) {
      for (let j = 0; j < rows; j++) {
        this.seats.push(
          new SeatBuilder()
            .withRow(j + 1)
            .withColumn(String.fromCharCode(i + 97))
            .withPrice(
              seatPrice ?? this.chance.integer({ min: 100, max: 1000 })
            )
            .withRoomId(this.entity.id)
            .build()
        );
      }
    }

    return this;
  }
}

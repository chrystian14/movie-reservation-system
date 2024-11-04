import { randomUUID } from "crypto";
import type { IRoomDao } from "../dao";
import type { Room, RoomAndSeats, RoomCreateInput } from "../types";
import { Chance } from "chance";
import type { Seat } from "modules/seats/types";
import type { ISeatDao } from "modules/seats/dao";
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

  async save(roomDao: IRoomDao, seatDao: ISeatDao): Promise<RoomAndSeats> {
    const savedRoom = await roomDao.create(this.entity);
    const savedSeats: Seat[] = [];
    for (const seat of this.seats) {
      const savedSeat = await seatDao.create(seat);
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

  withNumber(newNumber: number) {
    this.entity.number = newNumber;
    return this;
  }

  withName(newName: string) {
    this.entity.name = newName;
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

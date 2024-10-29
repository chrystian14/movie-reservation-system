import { randomUUID } from "crypto";
import type { IRoomRepository } from "../repository";
import type { Room, RoomAndSeats, RoomCreateInput } from "../types";
import { Chance } from "chance";
import { Prisma } from "@prisma/client";
import type { Seat } from "modules/seats/types";
import type { ISeatRepository } from "modules/seats/repository";

export class RoomBuilder {
  protected entity: Room;
  protected chance: Chance.Chance;
  protected seats: Seat[] = [];

  constructor() {
    this.chance = new Chance();

    const randomPriceString = this.chance.floating({
      min: 1,
      max: 100,
      fixed: 2,
    });

    this.entity = {
      id: randomUUID(),
      name: this.chance.word({ length: 10 }),
      columns: this.chance.integer({ min: 3, max: 10 }),
      rows: this.chance.integer({ min: 3, max: 10 }),
      baseSeatPrice: new Prisma.Decimal(randomPriceString),
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

  withNewUUID() {
    this.entity.id = randomUUID();
    return this;
  }

  withColumns(columnsCount: number) {
    this.entity.columns = columnsCount;
    return this;
  }

  withRows(rowsCount: number) {
    this.entity.rows = rowsCount;
    return this;
  }

  withPrice(price: number) {
    this.entity.baseSeatPrice = new Prisma.Decimal(price);
    return this;
  }

  requiredForCreation(): RoomCreateInput {
    return {
      name: this.entity.name,
      columns: this.entity.columns,
      rows: this.entity.rows,
      baseSeatPrice: this.entity.baseSeatPrice,
    };
  }

  requiredForPostBody() {
    return {
      name: this.entity.name,
      columns: this.entity.columns,
      rows: this.entity.rows,
      baseSeatPrice: this.entity.baseSeatPrice.toNumber(),
    };
  }

  generateSeats() {
    for (let i = 0; i < this.entity.columns; i++) {
      for (let j = 0; j < this.entity.rows; j++) {
        this.seats.push({
          id: randomUUID(),
          column: String.fromCharCode(i + 97),
          row: j + 1,
          price: this.entity.baseSeatPrice,
          roomId: this.entity.id,
        });
      }
    }

    return this;
  }
}

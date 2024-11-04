import { randomUUID } from "crypto";
import type { ISeatDao } from "../dao";
import type { Seat, SeatCreateInput, SeatWithoutRoomId } from "../types";
import { Chance } from "chance";
import { Prisma } from "@prisma/client";
import type { Override } from "modules/_shared/utils/types.util";

export type SeatPostBody = Override<
  SeatWithoutRoomId,
  {
    price: number;
  }
>;
export class SeatBuilder {
  protected entity: Seat;
  protected chance: Chance.Chance;

  constructor() {
    this.chance = new Chance();

    const randomPriceString = this.chance.floating({
      min: 1,
      max: 100,
      fixed: 2,
    });

    this.entity = {
      id: randomUUID(),
      column: this.chance.letter({ casing: "lower" }),
      row: this.chance.integer({ min: 1, max: 10 }),
      price: new Prisma.Decimal(randomPriceString),
      roomId: randomUUID(),
    };
  }

  build() {
    return this.entity;
  }

  async save(dao: ISeatDao) {
    return await dao.create(this.entity);
  }

  withNewUUID() {
    this.entity.id = randomUUID();
    return this;
  }

  withColumn(columnLetter: string) {
    this.entity.column = columnLetter;
    return this;
  }

  withRow(rowNumber: number) {
    this.entity.row = rowNumber;
    return this;
  }

  withPrice(price: number | Prisma.Decimal) {
    this.entity.price =
      price instanceof Prisma.Decimal ? price : new Prisma.Decimal(price);

    return this;
  }

  withRoomId(roomId: string) {
    this.entity.roomId = roomId;
    return this;
  }

  requiredForCreation(): SeatCreateInput {
    return {
      column: this.entity.column,
      row: this.entity.row,
      price: this.entity.price,
      roomId: this.entity.roomId,
    };
  }

  requiredForPostBody(): SeatPostBody {
    return {
      column: this.entity.column,
      row: this.entity.row,
      price: this.entity.price.toNumber(),
    };
  }
}

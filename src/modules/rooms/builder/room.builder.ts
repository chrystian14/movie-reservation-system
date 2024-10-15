import { randomUUID } from "crypto";
import type { IRoomRepository } from "../repository";
import type { Room, RoomCreateInput } from "../types";
import { Chance } from "chance";
import { Prisma } from "@prisma/client";

export class RoomBuilder {
  protected entity: Room;
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
      name: this.chance.word({ length: 10 }),
      columns: this.chance.integer({ min: 3, max: 10 }),
      rows: this.chance.integer({ min: 3, max: 10 }),
      baseSeatPrice: new Prisma.Decimal(randomPriceString),
    };
  }

  build() {
    return this.entity;
  }

  async save(repository: IRoomRepository) {
    return await repository.create(this.entity);
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
}

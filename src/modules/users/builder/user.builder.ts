import { randomUUID } from "crypto";
import type { User, UserCreateInput } from "../types";
import type { IUserRepository } from "../repository";
import { hashPassword } from "../utils";
import { Chance } from "chance";

export class UserBuilder {
  protected entity: User;
  protected chance: Chance.Chance;

  constructor() {
    this.chance = new Chance();
    const uniqueEmail = `${Date.now()}-${this.chance.email()}`;

    this.entity = {
      id: randomUUID(),
      firstName: this.chance.first(),
      lastName: this.chance.last(),
      email: uniqueEmail,
      password: this.chance.string({ length: 13 }),
      isAdmin: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  build() {
    return this.entity;
  }

  async save(repository: IUserRepository) {
    const hashedPassword = await hashPassword(this.entity.password);

    return await repository.create({
      ...this.entity,
      password: hashedPassword,
    });
  }

  withNewUUID() {
    this.entity.id = randomUUID();
    return this;
  }

  withNonAdminRole() {
    this.entity.isAdmin = false;
    return this;
  }

  withAdminRole() {
    this.entity.isAdmin = true;
    return this;
  }

  requiredForCreation(): UserCreateInput {
    return {
      firstName: this.entity.firstName,
      lastName: this.entity.lastName,
      email: this.entity.email,
      password: this.entity.password,
    };
  }
}

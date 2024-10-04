import { randomUUID } from "crypto";
import type { User, UserCreateInput } from "../types";
import type { IUserRepository } from "../repository";

export class UserBuilder {
  protected entity: User;

  constructor() {
    this.entity = {
      id: randomUUID(),
      firstName: "John Doe",
      lastName: "Doe",
      email: "john.doe@example.com",
      password: "password",
      isAdmin: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  build() {
    return this.entity;
  }

  async save(repository: IUserRepository) {
    return await repository.create(this.entity);
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

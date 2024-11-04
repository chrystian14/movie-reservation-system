import { randomUUID } from "crypto";
import type { User, UserCreateInput } from "../types";
import type { IUserDao } from "../dao";
import { hashPassword } from "../utils";
import { Chance } from "chance";
import type { FixedLengthArray } from "modules/_shared/utils/types.util";

export class UserBuilder {
  protected entity: User;
  protected chance: Chance.Chance;
  protected entities: User[] = [];

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

  buildMany<Length extends number>(
    numberOfUsers: Length,
    isAdmin: boolean
  ): User[] {
    this.entities = Array.from({ length: numberOfUsers }, () => {
      const user = new UserBuilder().build();
      user.isAdmin = isAdmin;
      return user;
    });

    return this.entities as FixedLengthArray<User, Length>;
  }

  async save(dao: IUserDao) {
    const hashedPassword = await hashPassword(this.entity.password);

    return await dao.create({
      ...this.entity,
      password: hashedPassword,
    });
  }

  async saveAll(dao: IUserDao) {
    const savedUsers = [];
    for (const user of this.entities) {
      const hashedPassword = await hashPassword(user.password);
      const savedUser = await dao.create({
        ...user,
        password: hashedPassword,
      });
      savedUsers.push(savedUser);
    }
    return savedUsers;
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

  withEmail(email: string) {
    this.entity.email = email;
    return this;
  }

  withPassword(password: string) {
    this.entity.password = password;
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

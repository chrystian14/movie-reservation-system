import { clearDatabase } from "modules/_shared/tests/clear-database";
import { apiClient } from "modules/_shared/tests";
import { status } from "modules/_shared/utils";
import { generateToken } from "modules/auth/jwt";
import { RoomBuilder } from "modules/rooms/builder";
import { RoomDao, type IRoomDao } from "modules/rooms/dao";
import { type Room } from "modules/rooms/types";
import { SeatDao, type ISeatDao } from "modules/seats/dao";
import { UserBuilder } from "modules/users/builder";
import { UserDao } from "modules/users/dao";
import { SeatBuilder } from "modules/seats/builder";
import type { SeatPostBody } from "modules/seats/builder/seat.builder";
import { randomUUID } from "crypto";

describe("INTEGRATION: SeatController.create - POST /api/v1/rooms/:roomId/seats", () => {
  const roomEndpoint = "/api/v1/rooms";

  let regularUserToken: string;
  let adminUserToken: string;

  let roomDao: IRoomDao;
  let seatDao: ISeatDao;

  let createdRoom: Room;
  let seatCreateInput: SeatPostBody;

  beforeEach(async () => {
    await clearDatabase();

    seatDao = new SeatDao();
    roomDao = new RoomDao();

    const userDao = new UserDao();
    const regularUserBuilder = new UserBuilder().withNonAdminRole();
    const regularUser = await regularUserBuilder.save(userDao);
    regularUserToken = generateToken(regularUser);

    const adminUserBuilder = new UserBuilder().withAdminRole();
    const adminUser = await adminUserBuilder.save(userDao);
    adminUserToken = generateToken(adminUser);

    seatCreateInput = new SeatBuilder().requiredForPostBody();

    roomDao = new RoomDao();
    seatDao = new SeatDao();
    ({ room: createdRoom } = await new RoomBuilder().save(roomDao, seatDao));
  });

  test("should return a 401 when user is not authenticated", async () => {
    const seatCreateEndpoint = `${roomEndpoint}/${createdRoom.id}/seats`;

    const response = await apiClient
      .post(seatCreateEndpoint)
      .send(seatCreateInput);

    const expectedResponseBody = {
      details: "Missing authorization header with bearer token",
    };

    expect(response.statusCode).toBe(status.HTTP_401_UNAUTHORIZED);
    expect(response.body).toEqual(expectedResponseBody);

    const seatCount = await seatDao.count();
    expect(seatCount).toBe(0);
  });

  test("should return a 403 when user is authenticated but not an admin", async () => {
    const seatCreateEndpoint = `${roomEndpoint}/${createdRoom.id}/seats`;
    const response = await apiClient
      .post(seatCreateEndpoint)
      .set("Authorization", `Bearer ${regularUserToken}`)
      .send(seatCreateInput);

    const expectedResponseBody = {
      details: "You don't have permission to perform this action",
    };

    expect(response.statusCode).toBe(status.HTTP_403_FORBIDDEN);
    expect(response.body).toEqual(expectedResponseBody);

    const seatCount = await seatDao.count();
    expect(seatCount).toBe(0);
  });

  test("should return an error when creating a seat with admin user but without required fields", async () => {
    const seatCreateEndpoint = `${roomEndpoint}/${createdRoom.id}/seats`;
    const response = await apiClient
      .post(seatCreateEndpoint)
      .set("Authorization", `Bearer ${adminUserToken}`)
      .send({});

    const expectedResponseBody = {
      details: [
        {
          field: ["column"],
          message: "Required",
        },
        {
          field: ["row"],
          message: "Required",
        },
        {
          field: ["price"],
          message: "Required",
        },
      ],
    };

    expect(response.status).toBe(status.HTTP_400_BAD_REQUEST);
    expect(response.body).toEqual(expectedResponseBody);

    const seatCount = await seatDao.count();
    expect(seatCount).toBe(0);
  });

  test("should return a 404 when creating a seat with non-existent room id", async () => {
    const nonExistingRoomId = randomUUID();
    const seatCreateEndpoint = `${roomEndpoint}/${nonExistingRoomId}/seats`;
    const response = await apiClient
      .post(seatCreateEndpoint)
      .set("Authorization", `Bearer ${adminUserToken}`)
      .send(seatCreateInput);

    const expectedResponseBody = {
      details: "Room not found",
    };

    expect(response.status).toBe(status.HTTP_404_NOT_FOUND);
    expect(response.body).toStrictEqual(expectedResponseBody);

    const seatCount = await seatDao.count();
    expect(seatCount).toBe(0);
  });

  test("should return a 422 when creating a seat in a room with column and row already taken", async () => {
    const columnAlreadyTaken = "A";
    const rowAlreadyTaken = 1;

    const seatBuilder = new SeatBuilder()
      .withColumn(columnAlreadyTaken)
      .withRow(rowAlreadyTaken)
      .withRoomId(createdRoom.id);

    await seatBuilder.save(seatDao);
    const seatColumnAndRowAlreadyTaken = seatBuilder.requiredForPostBody();

    const seatCreateEndpoint = `${roomEndpoint}/${createdRoom.id}/seats`;
    const response = await apiClient
      .post(seatCreateEndpoint)
      .set("Authorization", `Bearer ${adminUserToken}`)
      .send(seatColumnAndRowAlreadyTaken);

    const expectedResponseBody = {
      details: "Seat column and row already taken",
    };

    expect(response.status).toBe(status.HTTP_422_UNPROCESSABLE_ENTITY);
    expect(response.body).toStrictEqual(expectedResponseBody);

    const seatCount = await seatDao.count();
    expect(seatCount).toBe(1);
  });

  test("should return a 201 and create a seat with admin user credentials", async () => {
    const seatCreateEndpoint = `${roomEndpoint}/${createdRoom.id}/seats`;
    const response = await apiClient
      .post(seatCreateEndpoint)
      .set("Authorization", `Bearer ${adminUserToken}`)
      .send(seatCreateInput);

    expect(response.status).toBe(status.HTTP_201_CREATED);

    const expectedResponseBody = {
      id: expect.any(String),
      column: seatCreateInput.column,
      row: seatCreateInput.row,
      price: seatCreateInput.price.toString(),
      roomId: createdRoom.id,
    };

    expect(response.body).toStrictEqual(expectedResponseBody);

    const seatCount = await seatDao.count();
    expect(seatCount).toBe(1);
  });
});

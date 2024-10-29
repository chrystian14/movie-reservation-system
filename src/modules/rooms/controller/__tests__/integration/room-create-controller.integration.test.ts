import { clearDatabase } from "configs/jest-setup.config";
import { apiClient } from "modules/_shared/tests";
import { status, toDecimal } from "modules/_shared/utils";
import { generateToken } from "modules/auth/jwt";
import { RoomBuilder } from "modules/rooms/builder";
import { RoomRepository, type IRoomRepository } from "modules/rooms/repository";
import { type Room } from "modules/rooms/types";
import { SeatRepository, type ISeatRepository } from "modules/seats/repository";
import { UserBuilder } from "modules/users/builder";
import { UserRepository } from "modules/users/repository";

describe("INTEGRATION: RoomControler.create - POST /api/v1/rooms", () => {
  const roomEndpoint = "/api/v1/rooms";

  let regularUserToken: string;
  let adminUserToken: string;

  let roomRepository: IRoomRepository;
  let seatRepository: ISeatRepository;

  beforeEach(async () => {
    await clearDatabase();

    seatRepository = new SeatRepository();
    roomRepository = new RoomRepository();

    const userRepository = new UserRepository();
    const regularUserBuilder = new UserBuilder().withNonAdminRole();
    const regularUser = await regularUserBuilder.save(userRepository);
    regularUserToken = generateToken(regularUser);

    const adminUserBuilder = new UserBuilder().withAdminRole();
    const adminUser = await adminUserBuilder.save(userRepository);
    adminUserToken = generateToken(adminUser);
  });

  test("should return a 401 when user is not authenticated", async () => {
    const roomCreatePostBody = new RoomBuilder().requiredForPostBody();

    const response = await apiClient
      .post(roomEndpoint)
      .send(roomCreatePostBody);

    const expectedResponseBody = {
      details: "Missing authorization header with bearer token",
    };

    expect(response.statusCode).toBe(status.HTTP_401_UNAUTHORIZED);
    expect(response.body).toEqual(expectedResponseBody);

    const roomCount = await roomRepository.count();
    expect(roomCount).toBe(0);
  });

  test("should return a 403 when user is authenticated but not an admin", async () => {
    const roomCreatePostBody = new RoomBuilder().requiredForPostBody();

    const response = await apiClient
      .post(roomEndpoint)
      .set("Authorization", `Bearer ${regularUserToken}`)
      .send(roomCreatePostBody);

    const expectedResponseBody = {
      details: "You don't have permission to perform this action",
    };

    expect(response.statusCode).toBe(status.HTTP_403_FORBIDDEN);
    expect(response.body).toEqual(expectedResponseBody);

    const roomCount = await roomRepository.count();
    expect(roomCount).toBe(0);
  });

  test("should return an error when creating a room with admin user but without required fields", async () => {
    const response = await apiClient
      .post(roomEndpoint)
      .set("Authorization", `Bearer ${adminUserToken}`)
      .send({});

    const expectedResponseBody = {
      details: [
        {
          field: ["name"],
          message: "Required",
        },
        {
          field: ["rows"],
          message: "Required",
        },
        {
          field: ["columns"],
          message: "Required",
        },
        {
          field: ["baseSeatPrice"],
          message: "Required",
        },
      ],
    };

    expect(response.status).toBe(status.HTTP_400_BAD_REQUEST);
    expect(response.body).toEqual(expectedResponseBody);

    const roomCount = await roomRepository.count();
    expect(roomCount).toBe(0);
  });

  test("should return a 400 when rows is a negative number", async () => {
    const negativeRowsRoomCreateInput = new RoomBuilder()
      .withRows(-1)
      .requiredForPostBody();

    const response = await apiClient
      .post(roomEndpoint)
      .set("Authorization", `Bearer ${adminUserToken}`)
      .send(negativeRowsRoomCreateInput);

    const expectedResponseBody = {
      details: [
        {
          field: ["rows"],
          message: "Number must be greater than or equal to 0",
        },
      ],
    };

    expect(response.status).toBe(status.HTTP_400_BAD_REQUEST);
    expect(response.body).toStrictEqual(expectedResponseBody);
  });

  test("should return a 400 when columns is a negative number", async () => {
    const negativeColumnsRoomCreateInput = new RoomBuilder()
      .withColumns(-1)
      .requiredForPostBody();

    const response = await apiClient
      .post(roomEndpoint)
      .set("Authorization", `Bearer ${adminUserToken}`)
      .send(negativeColumnsRoomCreateInput);

    const expectedResponseBody = {
      details: [
        {
          field: ["columns"],
          message: "Number must be greater than or equal to 0",
        },
      ],
    };

    expect(response.status).toBe(status.HTTP_400_BAD_REQUEST);
    expect(response.body).toStrictEqual(expectedResponseBody);
  });

  test("should return a 400 when rows is a number greater than the maximum allowed (500)", async () => {
    const outOfRangeRowsRoomCreateInput = new RoomBuilder()
      .withRows(65536)
      .requiredForPostBody();

    const response = await apiClient
      .post(roomEndpoint)
      .set("Authorization", `Bearer ${adminUserToken}`)
      .send(outOfRangeRowsRoomCreateInput);

    const expectedResponseBody = {
      details: [
        {
          field: ["rows"],
          message: "Number must be less than or equal to 500",
        },
      ],
    };

    expect(response.status).toBe(status.HTTP_400_BAD_REQUEST);
    expect(response.body).toStrictEqual(expectedResponseBody);
  });

  test("should return a 400 when columns is a number greater than the maximum allowed (500)", async () => {
    const outOfRangeColumnsRoomCreateInput = new RoomBuilder()
      .withColumns(65536)
      .requiredForPostBody();

    const response = await apiClient
      .post(roomEndpoint)
      .set("Authorization", `Bearer ${adminUserToken}`)
      .send(outOfRangeColumnsRoomCreateInput);

    const expectedResponseBody = {
      details: [
        {
          field: ["columns"],
          message: "Number must be less than or equal to 500",
        },
      ],
    };

    expect(response.status).toBe(status.HTTP_400_BAD_REQUEST);
    expect(response.body).toStrictEqual(expectedResponseBody);
  });

  test("should return a 400 when baseSeatPrice is a negative decimal", async () => {
    const negativeBaseSeatPriceRoomCreateInput = new RoomBuilder()
      .withPrice(-10.1)
      .requiredForPostBody();

    const response = await apiClient
      .post(roomEndpoint)
      .set("Authorization", `Bearer ${adminUserToken}`)
      .send(negativeBaseSeatPriceRoomCreateInput);

    const expectedResponseBody = {
      details: [
        {
          field: ["baseSeatPrice"],
          message: "Number must be greater than or equal to 0",
        },
      ],
    };

    expect(response.status).toBe(status.HTTP_400_BAD_REQUEST);
    expect(response.body).toStrictEqual(expectedResponseBody);
  });

  test("should return a 400 when baseSeatPrice is a decimal with more than 2 decimal places", async () => {
    const invalidBaseSeatPriceRoomCreateInput = new RoomBuilder()
      .withPrice(10.1222)
      .requiredForPostBody();

    const response = await apiClient
      .post(roomEndpoint)
      .set("Authorization", `Bearer ${adminUserToken}`)
      .send(invalidBaseSeatPriceRoomCreateInput);

    const expectedResponseBody = {
      details: [
        {
          field: ["baseSeatPrice"],
          message: "Must be in decimal format with 2 decimal places",
        },
      ],
    };

    expect(response.status).toBe(status.HTTP_400_BAD_REQUEST);
    expect(response.body).toStrictEqual(expectedResponseBody);
  });

  test("should create a room with correct amount of seats if user is admin", async () => {
    const roomCreatePostBody = new RoomBuilder().requiredForPostBody();

    const response = await apiClient
      .post(roomEndpoint)
      .set("Authorization", `Bearer ${adminUserToken}`)
      .send(roomCreatePostBody);

    expect(response.status).toBe(status.HTTP_201_CREATED);

    const expectedResponseBody: Room = {
      id: expect.any(String),
      name: roomCreatePostBody.name,
      rows: roomCreatePostBody.rows,
      columns: roomCreatePostBody.columns,
      baseSeatPrice: toDecimal(roomCreatePostBody.baseSeatPrice),
    };

    expect(response.body).toStrictEqual({
      ...expectedResponseBody,
      baseSeatPrice: expectedResponseBody.baseSeatPrice.toString(),
    });

    const roomCount = await roomRepository.count();
    expect(roomCount).toBe(1);

    const seatCount = await seatRepository.countByRoomId(response.body.id);
    const expectedSeatCount =
      roomCreatePostBody.rows * roomCreatePostBody.columns;
    expect(seatCount).toBe(expectedSeatCount);
  });
});

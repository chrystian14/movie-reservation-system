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
    const roomCreatePostBody = new RoomBuilder().requiredForCreation();

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
    const roomCreatePostBody = new RoomBuilder().requiredForCreation();

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
          field: ["number"],
          message: "Required",
        },
      ],
    };

    expect(response.status).toBe(status.HTTP_400_BAD_REQUEST);
    expect(response.body).toEqual(expectedResponseBody);

    const roomCount = await roomRepository.count();
    expect(roomCount).toBe(0);
  });
});

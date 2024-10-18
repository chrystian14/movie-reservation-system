import { clearDatabase } from "configs/jest-setup.config";
import { randomUUID } from "crypto";
import { apiClient } from "modules/_shared/tests";
import { status } from "modules/_shared/utils";
import { generateToken } from "modules/auth/jwt";
import { ReservationBuilder } from "modules/reservations/builder";
import {
  ReservationRepository,
  type IReservationRepository,
} from "modules/reservations/repository";
import {
  type Reservation,
  type ReservationCreateInput,
} from "modules/reservations/types";
import { SeatRepository, type ISeatRepository } from "modules/seats/repository";
import { UserBuilder } from "modules/users/builder";
import { UserRepository } from "modules/users/repository";

describe("INTEGRATION: ReservationControler.create - POST /api/v1/reservations", () => {
  const reservationEndpoint = "/api/v1/reservations";

  let reservationBuilder: ReservationBuilder;
  let reservationCreateInput: ReservationCreateInput;

  let regularUserToken: string;
  let adminUserToken: string;

  let reservationRepository: IReservationRepository;
  let seatRepository: ISeatRepository;

  beforeEach(async () => {
    await clearDatabase();

    seatRepository = new SeatRepository();
    reservationRepository = new ReservationRepository();

    reservationBuilder = new ReservationBuilder();
    reservationCreateInput = reservationBuilder.requiredForCreation();

    const userRepository = new UserRepository();
    const regularUserBuilder = new UserBuilder().withNonAdminRole();
    const regularUser = await regularUserBuilder.save(userRepository);
    regularUserToken = generateToken(regularUser);

    const adminUserBuilder = new UserBuilder().withAdminRole();
    const adminUser = await adminUserBuilder.save(userRepository);
    adminUserToken = generateToken(adminUser);
  });

  test("should return a 401 when user is not authenticated", async () => {
    const response = await apiClient
      .post(reservationEndpoint)
      .send(reservationCreateInput);

    const expectedResponseBody = {
      details: "Missing authorization header with bearer token",
    };

    expect(response.statusCode).toBe(status.HTTP_401_UNAUTHORIZED);
    expect(response.body).toStrictEqual(expectedResponseBody);

    const reservationCount = await reservationRepository.count();
    expect(reservationCount).toBe(0);
  });

  test("should return a 400 when creating a reservation without required fields", async () => {
    const response = await apiClient
      .post(reservationEndpoint)
      .set("Authorization", `Bearer ${regularUserToken}`)
      .send({});

    const expectedResponseBody = {
      details: [
        {
          field: ["amountPaid"],
          message: "Invalid input",
        },
        {
          field: ["showtimeId"],
          message: "Required",
        },
        { field: ["seatIds"], message: "Required" },
      ],
    };

    expect(response.status).toBe(status.HTTP_400_BAD_REQUEST);
    expect(response.body.details).toIncludeSameMembers(
      expectedResponseBody.details
    );

    const reservationCount = await reservationRepository.count();
    expect(reservationCount).toBe(0);
  });

  test("should return a 404 if creating a reservation with a non-existing showtime id", async () => {
    const reservationWithNonExistentShowtimeId: ReservationCreateInput =
      reservationBuilder.withShowtimeId(randomUUID()).requiredForCreation();

    const response = await apiClient
      .post(reservationEndpoint)
      .set("Authorization", `Bearer ${regularUserToken}`)
      .send(reservationWithNonExistentShowtimeId);

    const expectedResponseBody = {
      details: "Showtime not found",
    };

    expect(response.status).toBe(status.HTTP_404_NOT_FOUND);
    expect(response.body).toStrictEqual(expectedResponseBody);

    const reservationCount = await reservationRepository.count();
    expect(reservationCount).toBe(0);
  });
});

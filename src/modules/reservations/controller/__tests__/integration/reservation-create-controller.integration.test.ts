import {
  ReservationStatus,
  type Room,
  type Seat,
  type Showtime,
} from "@prisma/client";
import { clearDatabase } from "configs/jest-setup.config";
import { randomUUID } from "crypto";
import { apiClient } from "modules/_shared/tests";
import { status } from "modules/_shared/utils";
import { generateToken } from "modules/auth/jwt";
import { GenreBuilder } from "modules/genres/builder";
import { GenreRepository } from "modules/genres/repository";
import { MovieBuilder } from "modules/movies/builder";
import { MovieRepository } from "modules/movies/repository";
import { ReservationBuilder } from "modules/reservations/builder";
import {
  ReservationRepository,
  type IReservationRepository,
} from "modules/reservations/repository";
import {
  type ReservationCreateInput,
  type ReservationCreateInputWithoutUserId,
} from "modules/reservations/types";
import { RoomBuilder } from "modules/rooms/builder";
import { RoomRepository } from "modules/rooms/repository";
import { SeatBuilder } from "modules/seats/builder";
import { SeatRepository, type ISeatRepository } from "modules/seats/repository";
import { ShowtimeBuilder } from "modules/showtimes/builder";
import { ShowtimeRepository } from "modules/showtimes/repository";
import { UserBuilder } from "modules/users/builder";
import { UserRepository } from "modules/users/repository";
import type { User } from "modules/users/types";

describe("INTEGRATION: ReservationControler.create - POST /api/v1/reservations", () => {
  const reservationEndpoint = "/api/v1/reservations";

  let regularUserToken: string;
  let regularUser: User;
  let adminUserToken: string;

  let createdRoom: Room;
  let createdShowtime: Showtime;

  let reservationRepository: IReservationRepository;
  let seatRepository: ISeatRepository;

  beforeEach(async () => {
    await clearDatabase();

    const userRepository = new UserRepository();
    const regularUserBuilder = new UserBuilder().withNonAdminRole();
    regularUser = await regularUserBuilder.save(userRepository);
    regularUserToken = generateToken(regularUser);

    const adminUserBuilder = new UserBuilder().withAdminRole();
    const adminUser = await adminUserBuilder.save(userRepository);
    adminUserToken = generateToken(adminUser);

    const createdGenre = await new GenreBuilder().save(new GenreRepository());
    const createdMovie = await new MovieBuilder()
      .withGenreId(createdGenre.id)
      .save(new MovieRepository());

    createdRoom = await new RoomBuilder().save(new RoomRepository());

    createdShowtime = await new ShowtimeBuilder()
      .withMovieId(createdMovie.id)
      .withRoomId(createdRoom.id)
      .save(new ShowtimeRepository());

    seatRepository = new SeatRepository();
    reservationRepository = new ReservationRepository();
  });

  test("should return a 401 when user is not authenticated", async () => {
    const reservationCreateInput: ReservationCreateInput =
      new ReservationBuilder().requiredForCreation();

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
      new ReservationBuilder()
        .withShowtimeId(randomUUID())
        .requiredForCreation();

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

  test("should return a 422 if any of the pretended seats is already reserved", async () => {
    const seatAlreadyReserved = await new SeatBuilder()
      .withRoomId(createdRoom.id)
      .save(seatRepository);

    await new ReservationBuilder()
      .withUserId(regularUser.id)
      .withSeatIds([seatAlreadyReserved.id])
      .withShowtimeId(createdShowtime.id)
      .save(reservationRepository);

    const reservationWithAlreadyReservedSeatInput: ReservationCreateInput =
      new ReservationBuilder()
        .withSeatIds([seatAlreadyReserved.id])
        .withShowtimeId(createdShowtime.id)
        .requiredForCreation();

    const response = await apiClient
      .post(reservationEndpoint)
      .set("Authorization", `Bearer ${regularUserToken}`)
      .send(reservationWithAlreadyReservedSeatInput);

    const expectedResponseBody = {
      details: "Seat(s) already reserved",
    };

    expect(response.status).toBe(status.HTTP_422_UNPROCESSABLE_ENTITY);
    expect(response.body).toStrictEqual(expectedResponseBody);

    const reservationCount = await reservationRepository.count();
    expect(reservationCount).toBe(1);
  });

  test("should return a 400 if seatIds is empty", async () => {
    const reservationInput: ReservationCreateInput = new ReservationBuilder()
      .withShowtimeId(createdShowtime.id)
      .requiredForCreation();

    const reservationWithEmptySeatIds = { ...reservationInput, seatIds: [] };

    const response = await apiClient
      .post(reservationEndpoint)
      .set("Authorization", `Bearer ${regularUserToken}`)
      .send(reservationWithEmptySeatIds);

    const expectedResponseBody = {
      details: [
        {
          field: ["seatIds"],
          message: "At least one seatId is required",
        },
      ],
    };

    expect(response.status).toBe(status.HTTP_400_BAD_REQUEST);
    expect(response.body).toStrictEqual(expectedResponseBody);

    const reservationCount = await reservationRepository.count();
    expect(reservationCount).toBe(0);
  });

  test("should create a reservation with regular user credentials", async () => {
    const firstSeatToReserve = await new SeatBuilder()
      .withRoomId(createdRoom.id)
      .save(seatRepository);

    const validReservationCreateInput: ReservationCreateInputWithoutUserId =
      new ReservationBuilder()
        .withShowtimeId(createdShowtime.id)
        .withAmountPaid(createdRoom.baseSeatPrice)
        .withSeatIds([firstSeatToReserve.id])
        .requiredForPostBody();

    const response = await apiClient
      .post(reservationEndpoint)
      .set("Authorization", `Bearer ${regularUserToken}`)
      .send(validReservationCreateInput);

    const expectedResponseBody = [
      {
        id: expect.any(String),
        userId: regularUser.id,
        status: ReservationStatus.CONFIRMED,
        amountPaid: createdRoom.baseSeatPrice.toString(),
        showtimeId: createdShowtime.id,
        seatId: firstSeatToReserve.id,
      },
    ];

    expect(response.statusCode).toBe(status.HTTP_201_CREATED);
    expect(response.body).toStrictEqual(expectedResponseBody);

    const reservationCount = await reservationRepository.count();
    expect(reservationCount).toBe(1);
  });

  test("should create multiple reservations if more than one valid seatId is passed", async () => {
    const firstSeatToReserve = await new SeatBuilder()
      .withRoomId(createdRoom.id)
      .save(seatRepository);

    const secondSeatToReserve = await new SeatBuilder()
      .withRoomId(createdRoom.id)
      .save(seatRepository);

    const seatIdsToReserve: [string, ...string[]] = [
      firstSeatToReserve.id,
      secondSeatToReserve.id,
    ];

    const multipleValidSeatIdsReservationCreateInput: ReservationCreateInputWithoutUserId =
      new ReservationBuilder()
        .withShowtimeId(createdShowtime.id)
        .withAmountPaid(createdRoom.baseSeatPrice)
        .withSeatIds(seatIdsToReserve)
        .requiredForPostBody();

    const response = await apiClient
      .post(reservationEndpoint)
      .set("Authorization", `Bearer ${regularUserToken}`)
      .send(multipleValidSeatIdsReservationCreateInput);

    const expectedResponseBody = seatIdsToReserve.map((seatId) => ({
      id: expect.any(String),
      userId: regularUser.id,
      status: ReservationStatus.CONFIRMED,
      amountPaid: createdRoom.baseSeatPrice.toString(),
      showtimeId: createdShowtime.id,
      seatId,
    }));

    expect(response.statusCode).toBe(status.HTTP_201_CREATED);
    expect(response.body).toStrictEqual(expectedResponseBody);

    const reservationCount = await reservationRepository.count();
    expect(reservationCount).toBe(seatIdsToReserve.length);
  });
});

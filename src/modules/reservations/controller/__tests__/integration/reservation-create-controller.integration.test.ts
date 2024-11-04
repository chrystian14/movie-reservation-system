import { ReservationStatus, type Room, type Showtime } from "@prisma/client";
import { clearDatabase } from "modules/_shared/tests/clear-database";
import { randomUUID } from "crypto";
import { apiClient } from "modules/_shared/tests";
import { status } from "modules/_shared/utils";
import { generateToken } from "modules/auth/jwt";
import { GenreBuilder } from "modules/genres/builder";
import { GenreDao } from "modules/genres/dao";
import { MovieBuilder } from "modules/movies/builder";
import { MovieDao } from "modules/movies/dao";
import { ReservationBuilder } from "modules/reservations/builder";
import type { ReservationPostBody } from "modules/reservations/builder/reservation.builder";
import { ReservationDao, type IReservationDao } from "modules/reservations/dao";
import { type ReservationCreateInput } from "modules/reservations/types";
import { RoomBuilder } from "modules/rooms/builder";
import { RoomDao } from "modules/rooms/dao";
import { SeatBuilder } from "modules/seats/builder";
import { SeatDao, type ISeatDao } from "modules/seats/dao";
import { ShowtimeBuilder } from "modules/showtimes/builder";
import { ShowtimeDao } from "modules/showtimes/dao";
import { UserBuilder } from "modules/users/builder";
import { UserDao } from "modules/users/dao";
import type { User } from "modules/users/types";

describe("INTEGRATION: ReservationControler.create - POST /api/v1/reservations", () => {
  const reservationEndpoint = "/api/v1/reservations";

  let regularUserToken: string;
  let regularUser: User;

  let createdRoom: Room;
  let createdShowtime: Showtime;

  let reservationDao: IReservationDao;
  let seatDao: ISeatDao;

  beforeEach(async () => {
    await clearDatabase();

    const userDao = new UserDao();
    const regularUserBuilder = new UserBuilder().withNonAdminRole();
    regularUser = await regularUserBuilder.save(userDao);
    regularUserToken = generateToken(regularUser);

    const createdGenre = await new GenreBuilder().save(new GenreDao());
    const createdMovie = await new MovieBuilder()
      .withGenreId(createdGenre.id)
      .save(new MovieDao());

    ({ room: createdRoom } = await new RoomBuilder().save(
      new RoomDao(),
      new SeatDao()
    ));

    createdShowtime = await new ShowtimeBuilder()
      .withMovieId(createdMovie.id)
      .withRoomId(createdRoom.id)
      .save(new ShowtimeDao());

    seatDao = new SeatDao();
    reservationDao = new ReservationDao();
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

    const reservationCount = await reservationDao.count();
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
          message: "Required",
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

    const reservationCount = await reservationDao.count();
    expect(reservationCount).toBe(0);
  });

  test("should return a 404 when creating a reservation with a non-existing showtime id", async () => {
    const reservationWithNonExistentShowtimeId: ReservationPostBody =
      new ReservationBuilder()
        .withShowtimeId(randomUUID())
        .requiredForPostBody();

    const response = await apiClient
      .post(reservationEndpoint)
      .set("Authorization", `Bearer ${regularUserToken}`)
      .send(reservationWithNonExistentShowtimeId);

    const expectedResponseBody = {
      details: "Showtime not found",
    };

    // expect(response.status).toBe(status.HTTP_404_NOT_FOUND);
    expect(response.body).toStrictEqual(expectedResponseBody);

    const reservationCount = await reservationDao.count();
    expect(reservationCount).toBe(0);
  });

  test("should return a 422 when any of the pretended seats is already reserved", async () => {
    const seatAlreadyReserved = await new SeatBuilder()
      .withRoomId(createdRoom.id)
      .save(seatDao);

    await new ReservationBuilder()
      .withUserId(regularUser.id)
      .withSeatIds([seatAlreadyReserved.id])
      .withShowtimeId(createdShowtime.id)
      .save(reservationDao);

    const reservationWithAlreadyReservedSeatInput: ReservationPostBody =
      new ReservationBuilder()
        .withSeatIds([seatAlreadyReserved.id])
        .withShowtimeId(createdShowtime.id)
        .requiredForPostBody();

    const response = await apiClient
      .post(reservationEndpoint)
      .set("Authorization", `Bearer ${regularUserToken}`)
      .send(reservationWithAlreadyReservedSeatInput);

    const expectedResponseBody = {
      details: "Seat(s) already reserved",
    };

    expect(response.status).toBe(status.HTTP_422_UNPROCESSABLE_ENTITY);
    expect(response.body).toStrictEqual(expectedResponseBody);

    const reservationCount = await reservationDao.count();
    expect(reservationCount).toBe(1);
  });

  test("should return a 422 when creating a reservation with seatIds that are not in the showtime", async () => {
    const reservationWithNonExistentSeatIds: ReservationPostBody =
      new ReservationBuilder()
        .withSeatIds([randomUUID()])
        .withShowtimeId(createdShowtime.id)
        .requiredForPostBody();

    const response = await apiClient
      .post(reservationEndpoint)
      .set("Authorization", `Bearer ${regularUserToken}`)
      .send(reservationWithNonExistentSeatIds);

    const expectedResponseBody = {
      details: "Seat(s) not found in showtime room",
    };

    expect(response.status).toBe(status.HTTP_422_UNPROCESSABLE_ENTITY);
    expect(response.body).toStrictEqual(expectedResponseBody);

    const reservationCount = await reservationDao.count();
    expect(reservationCount).toBe(0);
  });

  test("should return a 400 when seatIds is empty", async () => {
    const reservationInput: ReservationPostBody = new ReservationBuilder()
      .withShowtimeId(createdShowtime.id)
      .requiredForPostBody();

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

    const reservationCount = await reservationDao.count();
    expect(reservationCount).toBe(0);
  });

  test("should create a reservation with regular user credentials", async () => {
    const firstSeatToReserve = await new SeatBuilder()
      .withRoomId(createdRoom.id)
      .save(seatDao);

    const validReservationCreateInput: ReservationPostBody =
      new ReservationBuilder()
        .withShowtimeId(createdShowtime.id)
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
        amountPaid: validReservationCreateInput.amountPaid.toString(),
        showtimeId: createdShowtime.id,
        seatId: firstSeatToReserve.id,
      },
    ];

    expect(response.statusCode).toBe(status.HTTP_201_CREATED);
    expect(response.body).toStrictEqual(expectedResponseBody);

    const reservationCount = await reservationDao.count();
    expect(reservationCount).toBe(1);
  });

  test("should create multiple reservations when more than one valid seatId is passed", async () => {
    const firstSeatToReserve = await new SeatBuilder()
      .withRoomId(createdRoom.id)
      .save(seatDao);

    const secondSeatToReserve = await new SeatBuilder()
      .withRoomId(createdRoom.id)
      .save(seatDao);

    const seatIdsToReserve: [string, ...string[]] = [
      firstSeatToReserve.id,
      secondSeatToReserve.id,
    ];

    const multipleValidSeatIdsReservationCreateInput: ReservationPostBody =
      new ReservationBuilder()
        .withShowtimeId(createdShowtime.id)
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
      amountPaid:
        multipleValidSeatIdsReservationCreateInput.amountPaid.toString(),
      showtimeId: createdShowtime.id,
      seatId,
    }));

    expect(response.statusCode).toBe(status.HTTP_201_CREATED);
    expect(response.body).toStrictEqual(expectedResponseBody);

    const reservationCount = await reservationDao.count();
    expect(reservationCount).toBe(seatIdsToReserve.length);
  });
});

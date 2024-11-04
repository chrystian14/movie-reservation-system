import {
  ReservationStatus,
  type Movie,
  type Room,
  type Showtime,
} from "@prisma/client";
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
import { ReservationDao, type IReservationDao } from "modules/reservations/dao";
import { RoomBuilder } from "modules/rooms/builder";
import { RoomDao } from "modules/rooms/dao";
import { SeatDao } from "modules/seats/dao";
import type { Seat } from "modules/seats/types";
import { ShowtimeBuilder } from "modules/showtimes/builder";
import { ShowtimeDao } from "modules/showtimes/dao";
import { UserBuilder } from "modules/users/builder";
import { UserDao } from "modules/users/dao";
import type { User } from "modules/users/types";

describe("INTEGRATION: ReservationControler.cancel - DEL /api/v1/reservations/:id", () => {
  const reservationEndpoint = "/api/v1/reservations";

  let regularUserOne: User;
  let regularUserOneToken: string;

  let regularUserTwo: User;
  let regularUserTwoToken: string;

  let savedRoomOne: Room;
  let savedSeatsForRoomOne: Seat[];

  let savedShowtimeOne: Showtime;

  let createdMovie: Movie;

  let reservationDao: IReservationDao;

  beforeEach(async () => {
    await clearDatabase();

    const userDao = new UserDao();
    const regularUserOneBuilder = new UserBuilder().withNonAdminRole();
    regularUserOne = await regularUserOneBuilder.save(userDao);
    regularUserOneToken = generateToken(regularUserOne);

    const regularUserTwoBuilder = new UserBuilder().withNonAdminRole();
    regularUserTwo = await regularUserTwoBuilder.save(userDao);
    regularUserTwoToken = generateToken(regularUserTwo);

    const createdGenre = await new GenreBuilder().save(new GenreDao());
    createdMovie = await new MovieBuilder()
      .withGenreId(createdGenre.id)
      .save(new MovieDao());

    ({ room: savedRoomOne, seats: savedSeatsForRoomOne } =
      await new RoomBuilder()
        .generateSeats(5, 5)
        .save(new RoomDao(), new SeatDao()));

    savedShowtimeOne = await new ShowtimeBuilder()
      .withMovieId(createdMovie.id)
      .withRoomId(savedRoomOne.id)
      .save(new ShowtimeDao());

    reservationDao = new ReservationDao();
  });

  test("should return a 401 when user is not authenticated", async () => {
    const unexistentReservationId = randomUUID();
    const reservationCancelEndpoint =
      reservationEndpoint + "/" + unexistentReservationId;
    const response = await apiClient.delete(reservationCancelEndpoint);

    const expectedResponseBody = {
      details: "Missing authorization header with bearer token",
    };

    expect(response.statusCode).toBe(status.HTTP_401_UNAUTHORIZED);
    expect(response.body).toStrictEqual(expectedResponseBody);
  });

  test("should return a 404 when reservation does not exist", async () => {
    const unexistentReservationId = randomUUID();
    const reservationCancelEndpoint =
      reservationEndpoint + "/" + unexistentReservationId;

    const response = await apiClient
      .delete(reservationCancelEndpoint)
      .set("Authorization", `Bearer ${regularUserOneToken}`);

    const expectedResponseBody = {
      details: "Reservation not found",
    };

    expect(response.statusCode).toBe(status.HTTP_404_NOT_FOUND);
    expect(response.body).toStrictEqual(expectedResponseBody);
  });

  test("should return a 403 when user is not the owner of the reservation", async () => {
    const [userOneSeatOne, ..._restSeats] = savedSeatsForRoomOne;

    const [userOneReservationOne] = await new ReservationBuilder()
      .withUserId(regularUserOne.id)
      .withSeatIds([userOneSeatOne.id])
      .withShowtimeId(savedShowtimeOne.id)
      .save(reservationDao);

    const reservationCancelEndpoint =
      reservationEndpoint + "/" + userOneReservationOne.id;
    const response = await apiClient
      .delete(reservationCancelEndpoint)
      .set("Authorization", `Bearer ${regularUserTwoToken}`);

    const expectedResponseBody = {
      details: "You don't have permission to perform this action",
    };

    expect(response.statusCode).toBe(status.HTTP_403_FORBIDDEN);
    expect(response.body).toStrictEqual(expectedResponseBody);

    const reservation = await reservationDao.findById(userOneReservationOne.id);
    expect(reservation?.status).toBe(ReservationStatus.CONFIRMED);
  });

  test("should return a 422 when user is the owner of the reservation but the reservation is from past", async () => {
    const mockedPastDate = new Date(
      Date.now() - 1 * 24 * 60 * 60 * 1000
    ).toISOString();

    const savedShowtimeFromPast = await new ShowtimeBuilder()
      .withMovieId(createdMovie.id)
      .withRoomId(savedRoomOne.id)
      .withIsoDatetime(mockedPastDate)
      .save(new ShowtimeDao());

    const [userOneSeatOne, ..._restSeats] = savedSeatsForRoomOne;
    const reservationDao = new ReservationDao();
    const [userOneReservationOne] = await new ReservationBuilder()
      .withUserId(regularUserOne.id)
      .withSeatIds([userOneSeatOne.id])
      .withShowtimeId(savedShowtimeFromPast.id)
      .save(reservationDao);

    const reservationCancelEndpoint =
      reservationEndpoint + "/" + userOneReservationOne.id;

    const response = await apiClient
      .delete(reservationCancelEndpoint)
      .set("Authorization", `Bearer ${regularUserOneToken}`);

    const expectedResponseBody = {
      details: "Cannot cancel a reservation from a past showtime",
    };

    expect(response.statusCode).toBe(status.HTTP_422_UNPROCESSABLE_ENTITY);
    expect(response.body).toStrictEqual(expectedResponseBody);

    const reservation = await reservationDao.findById(userOneReservationOne.id);
    expect(reservation?.status).toBe(ReservationStatus.CONFIRMED);
  });

  test("should return a 204 and update reservation status to cancelled", async () => {
    const [userOneSeatOne, ..._restSeats] = savedSeatsForRoomOne;

    const [userOneReservationOne] = await new ReservationBuilder()
      .withUserId(regularUserOne.id)
      .withSeatIds([userOneSeatOne.id])
      .withShowtimeId(savedShowtimeOne.id)
      .save(reservationDao);

    const reservationCancelEndpoint =
      reservationEndpoint + "/" + userOneReservationOne.id;
    const response = await apiClient
      .delete(reservationCancelEndpoint)
      .set("Authorization", `Bearer ${regularUserOneToken}`);

    expect(response.statusCode).toBe(status.HTTP_204_NO_CONTENT);

    const updatedReservation = await reservationDao.findById(
      userOneReservationOne.id
    );
    expect(updatedReservation?.status).toBe(ReservationStatus.CANCELLED);
  });
});

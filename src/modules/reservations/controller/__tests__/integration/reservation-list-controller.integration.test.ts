import { type Room, type Showtime } from "@prisma/client";
import { clearDatabase } from "modules/_shared/tests/clear-database";
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

describe("INTEGRATION: ReservationController.list - GET /api/v1/reservations", () => {
  const reservationEndpoint = "/api/v1/reservations";

  let regularUserOne: User;
  let regularUserOneToken: string;

  let regularUserTwo: User;

  let savedRoomOne: Room;
  let savedSeatsForRoomOne: Seat[];

  let savedShowtimeOne: Showtime;

  let reservationDao: IReservationDao;

  beforeEach(async () => {
    await clearDatabase();

    const userDao = new UserDao();
    const regularUserOneBuilder = new UserBuilder().withNonAdminRole();
    regularUserOne = await regularUserOneBuilder.save(userDao);
    regularUserOneToken = generateToken(regularUserOne);

    const regularUserTwoBuilder = new UserBuilder().withNonAdminRole();
    regularUserTwo = await regularUserTwoBuilder.save(userDao);

    const createdGenre = await new GenreBuilder().save(new GenreDao());
    const createdMovie = await new MovieBuilder()
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
  });

  test("should return a 401 when user is not authenticated", async () => {
    const response = await apiClient.get(reservationEndpoint);

    const expectedResponseBody = {
      details: "Missing authorization header with bearer token",
    };

    expect(response.statusCode).toBe(status.HTTP_401_UNAUTHORIZED);
    expect(response.body).toStrictEqual(expectedResponseBody);
  });

  test("should return only reservations made by the user", async () => {
    const [
      userOneSeatOne,
      userOneSeatTwo,
      userTwoSeatOne,
      userTwoSeatTwo,
      ..._seatsRest
    ] = savedSeatsForRoomOne;

    reservationDao = new ReservationDao();

    const userOneReservations = await new ReservationBuilder()
      .withUserId(regularUserOne.id)
      .withSeatIds([userOneSeatOne.id, userOneSeatTwo.id])
      .withShowtimeId(savedShowtimeOne.id)
      .save(reservationDao);

    await new ReservationBuilder()
      .withUserId(regularUserTwo.id)
      .withSeatIds([userTwoSeatOne.id, userTwoSeatTwo.id])
      .withShowtimeId(savedShowtimeOne.id)
      .save(reservationDao);

    const response = await apiClient
      .get(reservationEndpoint)
      .set("Authorization", `Bearer ${regularUserOneToken}`);

    const expectedResponseBody = userOneReservations.map((reservation) => ({
      id: reservation.id,
      userId: reservation.userId,
      status: reservation.status,
      amountPaid: reservation.amountPaid.toString(),
      showtimeId: reservation.showtimeId,
      seatId: reservation.seatId,
    }));

    expect(response.statusCode).toBe(status.HTTP_200_OK);
    expect(response.body).toStrictEqual(expectedResponseBody);
  });

  test("should return all reservations when user is admin", async () => {
    const adminUser = await new UserBuilder()
      .withAdminRole()
      .save(new UserDao());
    const adminToken = generateToken(adminUser);

    const [
      userOneSeatOne,
      userOneSeatTwo,
      userTwoSeatOne,
      userTwoSeatTwo,
      ..._seatsRest
    ] = savedSeatsForRoomOne;

    reservationDao = new ReservationDao();

    const userOneReservations = await new ReservationBuilder()
      .withUserId(regularUserOne.id)
      .withSeatIds([userOneSeatOne.id, userOneSeatTwo.id])
      .withShowtimeId(savedShowtimeOne.id)
      .save(reservationDao);

    const userTwoReservations = await new ReservationBuilder()
      .withUserId(regularUserTwo.id)
      .withSeatIds([userTwoSeatOne.id, userTwoSeatTwo.id])
      .withShowtimeId(savedShowtimeOne.id)
      .save(reservationDao);

    const response = await apiClient
      .get(reservationEndpoint)
      .set("Authorization", `Bearer ${adminToken}`);

    const allReservations = userOneReservations.concat(userTwoReservations);

    const expectedResponseBody = allReservations.map((reservation) => ({
      id: reservation.id,
      userId: reservation.userId,
      status: reservation.status,
      amountPaid: reservation.amountPaid.toString(),
      showtimeId: reservation.showtimeId,
      seatId: reservation.seatId,
    }));

    expect(response.statusCode).toBe(status.HTTP_200_OK);
    expect(response.body).toStrictEqual(expectedResponseBody);
  });
});

import { clearDatabase } from "modules/_shared/tests/clear-database";
import { randomUUID } from "crypto";
import { apiClient } from "modules/_shared/tests";
import { status } from "modules/_shared/utils";
import { generateToken } from "modules/auth/jwt";
import { GenreBuilder } from "modules/genres/builder";
import { GenreDao } from "modules/genres/dao";
import { MovieBuilder } from "modules/movies/builder";
import { MovieDao } from "modules/movies/dao";
import type { Movie } from "modules/movies/types";
import { ReservationBuilder } from "modules/reservations/builder";
import { ReservationDao } from "modules/reservations/dao";
import { RoomBuilder } from "modules/rooms/builder";
import { RoomDao } from "modules/rooms/dao";
import type { Room } from "modules/rooms/types";
import { SeatBuilder } from "modules/seats/builder";
import { SeatDao, type ISeatDao } from "modules/seats/dao";
import { ShowtimeBuilder } from "modules/showtimes/builder";
import { ShowtimeDao } from "modules/showtimes/dao";
import type { Showtime } from "modules/showtimes/types";
import { UserBuilder } from "modules/users/builder";
import { UserDao } from "modules/users/dao";
import type { User } from "modules/users/types";

describe("INTEGRATION: ShowtimeControler.getAvailableSeats - GET /api/v1/showtimes/:id/available-seats", () => {
  const showtimeEndpoint = "/api/v1/showtimes";

  let createdShowtime: Showtime;

  let regularUser: User;
  let regularUserToken: string;

  let createdMovie: Movie;
  let createdRoom: Room;

  let seatDao: ISeatDao;

  beforeEach(async () => {
    await clearDatabase();

    seatDao = new SeatDao();

    const userDao = new UserDao();
    regularUser = await new UserBuilder().withNonAdminRole().save(userDao);
    regularUserToken = generateToken(regularUser);

    const createdGenre = await new GenreBuilder().save(new GenreDao());

    createdMovie = await new MovieBuilder()
      .withGenreId(createdGenre.id)
      .save(new MovieDao());

    ({ room: createdRoom } = await new RoomBuilder().save(
      new RoomDao(),
      new SeatDao()
    ));

    // showtimeBuilder = new ShowtimeBuilder();
    createdShowtime = await new ShowtimeBuilder()
      .withMovieId(createdMovie.id)
      .withRoomId(createdRoom.id)
      .save(new ShowtimeDao());
  });

  test("should return a 401 when user is not authenticated", async () => {
    const getAvailableSeatsEndpoint = `${showtimeEndpoint}/${createdShowtime.id}/available-seats`;
    const response = await apiClient.get(getAvailableSeatsEndpoint);

    const expectedResponseBody = {
      details: "Missing authorization header with bearer token",
    };

    expect(response.statusCode).toBe(status.HTTP_401_UNAUTHORIZED);
    expect(response.body).toEqual(expectedResponseBody);
  });

  test("should return a 404 when authenticated but showtime id is not found", async () => {
    const nonExistingShowtimeId = randomUUID();
    const getAvailableSeatsEndpoint = `${showtimeEndpoint}/${nonExistingShowtimeId}/available-seats`;
    const response = await apiClient
      .get(getAvailableSeatsEndpoint)
      .set("Authorization", `Bearer ${regularUserToken}`);

    const expectedResponseBody = {
      details: "Showtime not found",
    };

    expect(response.statusCode).toBe(status.HTTP_404_NOT_FOUND);
    expect(response.body).toEqual(expectedResponseBody);
  });

  test("should return all seats when no reservations exist for the showtime", async () => {
    const getAvailableSeatsEndpoint = `${showtimeEndpoint}/${createdShowtime.id}/available-seats`;
    const response = await apiClient
      .get(getAvailableSeatsEndpoint)
      .set("Authorization", `Bearer ${regularUserToken}`);

    const showtimeSeats = await seatDao.getAllSeatsByShowtimeId(
      createdShowtime.id
    );

    const expectedResponseBody = showtimeSeats.map((seat) => ({
      id: seat.id,
      column: seat.column,
      row: seat.row,
      price: seat.price.toString(),
    }));

    expect(response.statusCode).toBe(status.HTTP_200_OK);
    expect(response.body).toStrictEqual(expectedResponseBody);
  });

  test("should return only available seats when reservations exist for the showtime", async () => {
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

    await new ReservationBuilder()
      .withUserId(regularUser.id)
      .withShowtimeId(createdShowtime.id)
      .withSeatIds(seatIdsToReserve)
      .save(new ReservationDao());

    const showtimeSeats = await seatDao.getAllSeatsByShowtimeId(
      createdShowtime.id
    );

    const nonReservedSeats = showtimeSeats.filter(
      (seat) => !seatIdsToReserve.includes(seat.id)
    );

    const getAvailableSeatsEndpoint = `${showtimeEndpoint}/${createdShowtime.id}/available-seats`;
    const response = await apiClient
      .get(getAvailableSeatsEndpoint)
      .set("Authorization", `Bearer ${regularUserToken}`);

    const expectedResponseBody = nonReservedSeats.map((seat) => ({
      id: seat.id,
      column: seat.column,
      row: seat.row,
      price: seat.price.toString(),
    }));

    expect(response.statusCode).toBe(status.HTTP_200_OK);
    expect(response.body).toStrictEqual(expectedResponseBody);
  });
});

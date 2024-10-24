import type { Movie, Room, Showtime } from "@prisma/client";
import { clearDatabase } from "configs/jest-setup.config";
import { randomUUID } from "crypto";
import { apiClient } from "modules/_shared/tests";
import { status } from "modules/_shared/utils";
import { generateToken } from "modules/auth/jwt";
import { GenreBuilder } from "modules/genres/builder";
import { GenreRepository } from "modules/genres/repository";
import { MovieBuilder } from "modules/movies/builder";
import { MovieRepository } from "modules/movies/repository";
import { RoomBuilder } from "modules/rooms/builder";
import { RoomRepository } from "modules/rooms/repository";
import { SeatRepository, type ISeatRepository } from "modules/seats/repository";
import { ShowtimeBuilder } from "modules/showtimes/builder";
import { ShowtimeRepository } from "modules/showtimes/repository";
import { UserBuilder } from "modules/users/builder";
import { UserRepository } from "modules/users/repository";

describe("INTEGRATION: ShowtimeControler.getAvailableSeats - GET /api/v1/showtimes/:id/available-seats", () => {
  const showtimeEndpoint = "/api/v1/showtimes";

  let createdShowtime: Showtime;

  let regularUserToken: string;
  let adminUserToken: string;

  let createdMovie: Movie;
  let createdRoom: Room;

  let seatRepository: ISeatRepository;

  beforeEach(async () => {
    await clearDatabase();

    seatRepository = new SeatRepository();

    const userRepository = new UserRepository();
    const regularUser = await new UserBuilder()
      .withNonAdminRole()
      .save(userRepository);
    regularUserToken = generateToken(regularUser);

    const adminUser = await new UserBuilder()
      .withAdminRole()
      .save(userRepository);
    adminUserToken = generateToken(adminUser);

    const createdGenre = await new GenreBuilder().save(new GenreRepository());

    createdMovie = await new MovieBuilder()
      .withGenreId(createdGenre.id)
      .save(new MovieRepository());

    createdRoom = await new RoomBuilder().save(new RoomRepository());

    // showtimeBuilder = new ShowtimeBuilder();
    createdShowtime = await new ShowtimeBuilder()
      .withMovieId(createdMovie.id)
      .withRoomId(createdRoom.id)
      .save(new ShowtimeRepository());
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

    const showtimeSeats = await seatRepository.getAllSeatsByShowtimeId(
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
});

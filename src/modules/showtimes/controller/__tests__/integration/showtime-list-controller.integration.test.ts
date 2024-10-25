import { clearDatabase } from "configs/jest-setup.config";
import { apiClient } from "modules/_shared/tests";
import { status } from "modules/_shared/utils";
import { generateToken } from "modules/auth/jwt";
import { GenreBuilder } from "modules/genres/builder";
import { GenreRepository } from "modules/genres/repository";
import { MovieBuilder } from "modules/movies/builder";
import { MovieRepository } from "modules/movies/repository";
import type { Movie } from "modules/movies/types";
import { RoomBuilder } from "modules/rooms/builder";
import { RoomRepository } from "modules/rooms/repository";
import type { Room } from "modules/rooms/types";
import { ShowtimeBuilder } from "modules/showtimes/builder";
import { ShowtimeRepository } from "modules/showtimes/repository";
import { UserBuilder } from "modules/users/builder";
import { UserRepository } from "modules/users/repository";
import type { User } from "modules/users/types";

describe("INTEGRATION: ShowtimeControler.list - GET /api/v1/showtimes", () => {
  const showtimeEndpoint = "/api/v1/showtimes";

  let regularUser: User;
  let regularUserToken: string;

  let createdMovie: Movie;
  let createdRoom: Room;

  beforeEach(async () => {
    await clearDatabase();

    regularUser = await new UserBuilder()
      .withNonAdminRole()
      .save(new UserRepository());
    regularUserToken = generateToken(regularUser);

    const createdGenre = await new GenreBuilder().save(new GenreRepository());

    createdMovie = await new MovieBuilder()
      .withGenreId(createdGenre.id)
      .save(new MovieRepository());

    createdRoom = await new RoomBuilder().save(new RoomRepository());
  });

  test("should return a 401 when user is not authenticated", async () => {
    const response = await apiClient.get(showtimeEndpoint);

    const expectedResponseBody = {
      details: "Missing authorization header with bearer token",
    };

    expect(response.statusCode).toBe(status.HTTP_401_UNAUTHORIZED);
    expect(response.body).toEqual(expectedResponseBody);
  });

  test("should return a 400 when query param is not a valid date", async () => {
    const invalidDateFormat = "01/12/2022";
    const response = await apiClient
      .get(showtimeEndpoint)
      .set("Authorization", `Bearer ${regularUserToken}`)
      .query({ date: invalidDateFormat });

    const expectedResponseBody = {
      details: [
        {
          message: "Invalid date. Date param must be in the format YYYY-MM-DD",
          field: ["date"],
        },
      ],
    };

    expect(response.statusCode).toBe(status.HTTP_400_BAD_REQUEST);
    expect(response.body).toStrictEqual(expectedResponseBody);
  });

  test("should list all showtimes when no query params are passed", async () => {
    const numberOfShowtimesToCreate = 4;
    const showtimeStartDate = new Date("03-03-1993");
    const intervalBetweenShowtimesInMinutes = 120;

    const showtimeBuilder = new ShowtimeBuilder();
    showtimeBuilder.buildMany(
      createdMovie.id,
      createdRoom.id,
      numberOfShowtimesToCreate,
      showtimeStartDate,
      intervalBetweenShowtimesInMinutes
    );
    const savedShowtimes = await showtimeBuilder.saveAll(
      new ShowtimeRepository()
    );

    const response = await apiClient
      .get(showtimeEndpoint)
      .set("Authorization", `Bearer ${regularUserToken}`);

    const expectedResponseBody = savedShowtimes.map((showtime) => ({
      id: showtime.id,
      datetime: showtime.datetime.toISOString(),
      movieId: showtime.movieId,
      roomId: showtime.roomId,
    }));

    expect(response.statusCode).toBe(status.HTTP_200_OK);
    expect(response.body).toStrictEqual(expectedResponseBody);
  });
});
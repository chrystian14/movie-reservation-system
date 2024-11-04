import { clearDatabase } from "modules/_shared/tests/clear-database";
import { apiClient } from "modules/_shared/tests";
import { status } from "modules/_shared/utils";
import { generateToken } from "modules/auth/jwt";
import { GenreBuilder } from "modules/genres/builder";
import { GenreDao } from "modules/genres/dao";
import { MovieBuilder } from "modules/movies/builder";
import { MovieDao } from "modules/movies/dao";
import type { Movie } from "modules/movies/types";
import { RoomBuilder } from "modules/rooms/builder";
import { RoomDao } from "modules/rooms/dao";
import type { Room } from "modules/rooms/types";
import { SeatDao } from "modules/seats/dao";
import { ShowtimeBuilder } from "modules/showtimes/builder";
import { ShowtimeDao } from "modules/showtimes/dao";
import { UserBuilder } from "modules/users/builder";
import { UserDao } from "modules/users/dao";
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
      .save(new UserDao());
    regularUserToken = generateToken(regularUser);

    const createdGenre = await new GenreBuilder().save(new GenreDao());

    createdMovie = await new MovieBuilder()
      .withGenreId(createdGenre.id)
      .save(new MovieDao());

    ({ room: createdRoom } = await new RoomBuilder().save(
      new RoomDao(),
      new SeatDao()
    ));
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

  test("should list all showtimes from page 1 in desc order when no date query param is passed", async () => {
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
    const savedShowtimes = await showtimeBuilder.saveAll(new ShowtimeDao());
    const orderedDescSavedShowtimes = savedShowtimes.sort(
      (a, b) => b.datetime.getTime() - a.datetime.getTime()
    );
    const response = await apiClient
      .get(showtimeEndpoint)
      .set("Authorization", `Bearer ${regularUserToken}`);

    const expectedResponseBody = orderedDescSavedShowtimes.map((showtime) => ({
      id: showtime.id,
      datetime: showtime.datetime.toISOString(),
      movieId: showtime.movieId,
      roomId: showtime.roomId,
    }));

    expect(response.statusCode).toBe(status.HTTP_200_OK);
    expect(response.body).toStrictEqual(expectedResponseBody);
  });

  test('should list only showtimes within date range and in desc order when "date" query param is passed', async () => {
    const showtimeDao = new ShowtimeDao();

    const outOfRangeShowtimeBuilder = new ShowtimeBuilder();
    outOfRangeShowtimeBuilder.buildMany(
      createdMovie.id,
      createdRoom.id,
      5,
      new Date("2024-03-15T00:00:00Z"),
      120
    );
    await outOfRangeShowtimeBuilder.saveAll(showtimeDao);

    const inRangeShowtimeBuilder = new ShowtimeBuilder();
    inRangeShowtimeBuilder.buildMany(
      createdMovie.id,
      createdRoom.id,
      5,
      new Date("2024-03-17T00:00:00Z"),
      120
    );
    const inRangeSavedShowtimes = await inRangeShowtimeBuilder.saveAll(
      showtimeDao
    );
    const orderedDescinRangeSavedShowtimes = inRangeSavedShowtimes.sort(
      (a, b) => b.datetime.getTime() - a.datetime.getTime()
    );
    const response = await apiClient
      .get(showtimeEndpoint)
      .set("Authorization", `Bearer ${regularUserToken}`)
      .query({ date: "2024-03-17" });

    const expectedResponseBody = orderedDescinRangeSavedShowtimes.map(
      (showtime) => ({
        id: showtime.id,
        datetime: showtime.datetime.toISOString(),
        movieId: showtime.movieId,
        roomId: showtime.roomId,
      })
    );

    expect(response.statusCode).toBe(status.HTTP_200_OK);
    expect(response.body).toStrictEqual(expectedResponseBody);
  });
});

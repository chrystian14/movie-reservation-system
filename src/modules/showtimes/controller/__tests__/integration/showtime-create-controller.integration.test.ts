import type { Movie, Room } from "@prisma/client";
import { clearDatabase } from "modules/_shared/tests/clear-database";
import { randomUUID } from "crypto";
import { apiClient } from "modules/_shared/tests";
import { status } from "modules/_shared/utils";
import { generateToken } from "modules/auth/jwt";
import { GenreBuilder } from "modules/genres/builder";
import { GenreDao } from "modules/genres/dao";
import { MovieBuilder } from "modules/movies/builder";
import { MovieDao } from "modules/movies/dao";
import { RoomBuilder } from "modules/rooms/builder";
import { RoomDao } from "modules/rooms/dao";
import { SeatDao } from "modules/seats/dao";
import { ShowtimeBuilder } from "modules/showtimes/builder";
import { ShowtimeDao, type IShowtimeDao } from "modules/showtimes/dao";
import { type ShowtimeCreateInput } from "modules/showtimes/types";
import { UserBuilder } from "modules/users/builder";
import { UserDao } from "modules/users/dao";

describe("INTEGRATION: ShowtimeControler.create - POST /api/v1/showtimes", () => {
  const showtimeEndpoint = "/api/v1/showtimes";

  let showtimeDao: IShowtimeDao;
  let showtimeBuilder: ShowtimeBuilder;
  let validShowtimeInput: ShowtimeCreateInput;

  let regularUserToken: string;
  let adminUserToken: string;

  let createdMovie: Movie;
  let createdRoom: Room;

  beforeEach(async () => {
    await clearDatabase();

    const userDao = new UserDao();
    const regularUser = await new UserBuilder()
      .withNonAdminRole()
      .save(userDao);
    regularUserToken = generateToken(regularUser);

    const adminUser = await new UserBuilder().withAdminRole().save(userDao);
    adminUserToken = generateToken(adminUser);

    const createdGenre = await new GenreBuilder().save(new GenreDao());

    createdMovie = await new MovieBuilder()
      .withGenreId(createdGenre.id)
      .save(new MovieDao());

    ({ room: createdRoom } = await new RoomBuilder().save(
      new RoomDao(),
      new SeatDao()
    ));

    showtimeDao = new ShowtimeDao();
    showtimeBuilder = new ShowtimeBuilder();
    validShowtimeInput = showtimeBuilder
      .withMovieId(createdMovie.id)
      .withRoomId(createdRoom.id)
      .requiredForCreation();
  });

  test("should return a 401 when user is not authenticated", async () => {
    const response = await apiClient
      .post(showtimeEndpoint)
      .send(validShowtimeInput);

    const expectedResponseBody = {
      details: "Missing authorization header with bearer token",
    };

    expect(response.statusCode).toBe(status.HTTP_401_UNAUTHORIZED);
    expect(response.body).toEqual(expectedResponseBody);

    const showtimeCount = await showtimeDao.count();
    expect(showtimeCount).toBe(0);
  });

  test("should return a 403 when user is authenticated but not an admin", async () => {
    const response = await apiClient
      .post(showtimeEndpoint)
      .set("Authorization", `Bearer ${regularUserToken}`)
      .send(validShowtimeInput);

    const expectedResponseBody = {
      details: "You don't have permission to perform this action",
    };

    expect(response.statusCode).toBe(status.HTTP_403_FORBIDDEN);
    expect(response.body).toEqual(expectedResponseBody);

    const showtimeCount = await showtimeDao.count();
    expect(showtimeCount).toBe(0);
  });

  test("should return a 400 when creating a showtime with admin user but without required fields", async () => {
    const response = await apiClient
      .post(showtimeEndpoint)
      .set("Authorization", `Bearer ${adminUserToken}`)
      .send({});

    const expectedResponseBody = {
      details: [
        {
          field: ["datetime"],
          message: "Required",
        },
        {
          field: ["movieId"],
          message: "Required",
        },
        {
          field: ["roomId"],
          message: "Required",
        },
      ],
    };

    expect(response.status).toBe(status.HTTP_400_BAD_REQUEST);
    expect(response.body).toEqual(expectedResponseBody);

    const showtimeCount = await showtimeDao.count();
    expect(showtimeCount).toBe(0);
  });

  test("should return a 404 when creating a showtime with non-existent room id", async () => {
    const showtimeWithInvalidRoomId = {
      ...validShowtimeInput,
      roomId: randomUUID(),
    };

    const response = await apiClient
      .post(showtimeEndpoint)
      .set("Authorization", `Bearer ${adminUserToken}`)
      .send(showtimeWithInvalidRoomId);

    const expectedResponseBody = {
      details: "Room not found",
    };

    expect(response.status).toBe(status.HTTP_404_NOT_FOUND);
    expect(response.body).toEqual(expectedResponseBody);

    const showtimeCount = await showtimeDao.count();
    expect(showtimeCount).toBe(0);
  });

  test("should return a 404 when creating a showtime with non-existent movie id", async () => {
    const showtimeWithInvalidMovieId = {
      ...validShowtimeInput,
      movieId: randomUUID(),
    };

    const response = await apiClient
      .post(showtimeEndpoint)
      .set("Authorization", `Bearer ${adminUserToken}`)
      .send(showtimeWithInvalidMovieId);

    const expectedResponseBody = {
      details: "Movie not found",
    };

    expect(response.status).toBe(status.HTTP_404_NOT_FOUND);
    expect(response.body).toEqual(expectedResponseBody);

    const showtimeCount = await showtimeDao.count();
    expect(showtimeCount).toBe(0);
  });

  test("should return a 400 when creating a showtime with invalid datetime format", async () => {
    const showtimeWithInvalidDatetimeFormat = {
      ...validShowtimeInput,
      datetime: "2022-01-01",
    };

    const response = await apiClient
      .post(showtimeEndpoint)
      .set("Authorization", `Bearer ${adminUserToken}`)
      .send(showtimeWithInvalidDatetimeFormat);

    const expectedResponseBody = {
      details: [
        {
          field: ["datetime"],
          message:
            "Invalid datetime format. Format must be ISO8601: `YYYY-MM-DDTHH:mm:ssZ`",
        },
      ],
    };

    expect(response.status).toBe(status.HTTP_400_BAD_REQUEST);
    expect(response.body).toEqual(expectedResponseBody);

    const showtimeCount = await showtimeDao.count();
    expect(showtimeCount).toBe(0);
  });

  test("should return a 422 when creating a showtime with a datetime in the past", async () => {
    const pastDatetimeShowtimeInput = {
      ...validShowtimeInput,
      datetime: "2020-01-01T00:00:00Z",
    };

    const response = await apiClient
      .post(showtimeEndpoint)
      .set("Authorization", `Bearer ${adminUserToken}`)
      .send(pastDatetimeShowtimeInput);

    const expectedResponseBody = {
      details: "Datetime must be in the future",
    };

    expect(response.status).toBe(status.HTTP_422_UNPROCESSABLE_ENTITY);
    expect(response.body).toEqual(expectedResponseBody);

    const showtimeCount = await showtimeDao.count();
    expect(showtimeCount).toBe(0);
  });

  test("should create a showtime with admin user credentials", async () => {
    const response = await apiClient
      .post(showtimeEndpoint)
      .set("Authorization", `Bearer ${adminUserToken}`)
      .send(validShowtimeInput);

    const expectedResponseBody = {
      id: expect.any(String),
      datetime: validShowtimeInput.datetime.toISOString(),
      movieId: validShowtimeInput.movieId,
      roomId: validShowtimeInput.roomId,
    };

    expect(response.status).toBe(status.HTTP_201_CREATED);
    expect(response.body).toEqual(expectedResponseBody);

    const showtimeCount = await showtimeDao.count();
    expect(showtimeCount).toBe(1);
  });
});

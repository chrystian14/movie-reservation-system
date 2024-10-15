import type { Movie, Room } from "@prisma/client";
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
import { ShowtimeBuilder } from "modules/showtimes/builder";
import {
  ShowtimeRepository,
  type IShowtimeRepository,
} from "modules/showtimes/repository";
import { type ShowtimeCreateInput } from "modules/showtimes/types";
import { UserBuilder } from "modules/users/builder";
import { UserRepository } from "modules/users/repository";

describe("INTEGRATION: ShowtimeControler.create - POST /api/v1/showtimes", () => {
  const showtimeEndpoint = "/api/v1/showtimes";

  let showtimeRepository: IShowtimeRepository;
  let showtimeBuilder: ShowtimeBuilder;
  let showtimeCreateInput: ShowtimeCreateInput;

  let regularUserToken: string;
  let adminUserToken: string;

  let createdMovie: Movie;
  let createdRoom: Room;

  beforeEach(async () => {
    await clearDatabase();

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

    showtimeRepository = new ShowtimeRepository();
    showtimeBuilder = new ShowtimeBuilder();
    showtimeCreateInput = showtimeBuilder
      .withMovieId(createdMovie.id)
      .withRoomId(createdRoom.id)
      .requiredForCreation();
  });

  test("should return a 401 when user is not authenticated", async () => {
    const response = await apiClient
      .post(showtimeEndpoint)
      .send(showtimeCreateInput);

    const expectedResponseBody = {
      details: "Missing authorization header with bearer token",
    };

    expect(response.statusCode).toBe(status.HTTP_401_UNAUTHORIZED);
    expect(response.body).toEqual(expectedResponseBody);

    const showtimeCount = await showtimeRepository.count();
    expect(showtimeCount).toBe(0);
  });

  test("should return a 403 when user is authenticated but not an admin", async () => {
    const response = await apiClient
      .post(showtimeEndpoint)
      .set("Authorization", `Bearer ${regularUserToken}`)
      .send(showtimeCreateInput);

    const expectedResponseBody = {
      details: "You don't have permission to perform this action",
    };

    expect(response.statusCode).toBe(status.HTTP_403_FORBIDDEN);
    expect(response.body).toEqual(expectedResponseBody);

    const showtimeCount = await showtimeRepository.count();
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

    const showtimeCount = await showtimeRepository.count();
    expect(showtimeCount).toBe(0);
  });

  test("should return a 404 when creating a showtime with non-existent room id", async () => {
    const showtimeWithInvalidRoomId = {
      ...showtimeCreateInput,
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

    const showtimeCount = await showtimeRepository.count();
    expect(showtimeCount).toBe(0);
  });

  test("should return a 404 when creating a showtime with non-existent movie id", async () => {
    const showtimeWithInvalidMovieId = {
      ...showtimeCreateInput,
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

    const showtimeCount = await showtimeRepository.count();
    expect(showtimeCount).toBe(0);
  });

  test("should return a 400 when creating a showtime with invalid datetime format", async () => {
    const showtimeWithInvalidDatetimeFormat = {
      ...showtimeCreateInput,
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
            "Invalid datetime format. Format must be `YYYY-MM-DDTHH:mm:ss`",
        },
      ],
    };

    expect(response.status).toBe(status.HTTP_400_BAD_REQUEST);
    expect(response.body).toEqual(expectedResponseBody);
  });

  test.todo(
    "should return a 422 when creating a showtime with a datetime in the past"
  );

  test.todo("should create a showtime with admin user credentials");
});

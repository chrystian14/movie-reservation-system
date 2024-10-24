import { clearDatabase } from "configs/jest-setup.config";
import { randomUUID } from "crypto";
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
import type { Showtime } from "modules/showtimes/types";
import { UserBuilder } from "modules/users/builder";
import { UserRepository } from "modules/users/repository";
import type { User } from "modules/users/types";

describe("INTEGRATION: ShowtimeControler.list - GET /api/v1/showtimes", () => {
  const showtimeEndpoint = "/api/v1/showtimes";

  let regularUser: User;
  let regularUserToken: string;
  let adminUserToken: string;

  let createdMovie: Movie;
  let createdRoom: Room;

  beforeEach(async () => {
    await clearDatabase();

    const userRepository = new UserRepository();
    regularUser = await new UserBuilder()
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
  });

  test("should return a 401 when user is not authenticated", async () => {
    const response = await apiClient.get(showtimeEndpoint);

    const expectedResponseBody = {
      details: "Missing authorization header with bearer token",
    };

    expect(response.statusCode).toBe(status.HTTP_401_UNAUTHORIZED);
    expect(response.body).toEqual(expectedResponseBody);
  });
});

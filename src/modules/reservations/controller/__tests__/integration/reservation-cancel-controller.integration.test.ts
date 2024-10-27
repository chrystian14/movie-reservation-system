import { type Room, type Showtime } from "@prisma/client";
import { clearDatabase } from "configs/jest-setup.config";
import { randomUUID } from "crypto";
import { apiClient } from "modules/_shared/tests";
import { status } from "modules/_shared/utils";
import { generateToken } from "modules/auth/jwt";
import { GenreBuilder } from "modules/genres/builder";
import { GenreRepository } from "modules/genres/repository";
import { MovieBuilder } from "modules/movies/builder";
import { MovieRepository } from "modules/movies/repository";
import { ReservationBuilder } from "modules/reservations/builder";
import { ReservationRepository } from "modules/reservations/repository";
import { RoomBuilder } from "modules/rooms/builder";
import { RoomRepository } from "modules/rooms/repository";
import { SeatRepository } from "modules/seats/repository";
import type { Seat } from "modules/seats/types";
import { ShowtimeBuilder } from "modules/showtimes/builder";
import { ShowtimeRepository } from "modules/showtimes/repository";
import { UserBuilder } from "modules/users/builder";
import { UserRepository } from "modules/users/repository";
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

  beforeEach(async () => {
    await clearDatabase();

    const userRepository = new UserRepository();
    const regularUserOneBuilder = new UserBuilder().withNonAdminRole();
    regularUserOne = await regularUserOneBuilder.save(userRepository);
    regularUserOneToken = generateToken(regularUserOne);

    const regularUserTwoBuilder = new UserBuilder().withNonAdminRole();
    regularUserTwo = await regularUserTwoBuilder.save(userRepository);
    regularUserTwoToken = generateToken(regularUserTwo);

    const createdGenre = await new GenreBuilder().save(new GenreRepository());
    const createdMovie = await new MovieBuilder()
      .withGenreId(createdGenre.id)
      .save(new MovieRepository());

    ({ room: savedRoomOne, seats: savedSeatsForRoomOne } =
      await new RoomBuilder()
        .generateSeats()
        .save(new RoomRepository(), new SeatRepository()));

    savedShowtimeOne = await new ShowtimeBuilder()
      .withMovieId(createdMovie.id)
      .withRoomId(savedRoomOne.id)
      .save(new ShowtimeRepository());
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
      .save(new ReservationRepository());

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
  });
});

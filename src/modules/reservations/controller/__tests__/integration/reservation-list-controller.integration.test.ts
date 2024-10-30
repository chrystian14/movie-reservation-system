import { type Room, type Showtime } from "@prisma/client";
import { clearDatabase } from "configs/jest-setup.config";
import { apiClient } from "modules/_shared/tests";
import { status } from "modules/_shared/utils";
import { generateToken } from "modules/auth/jwt";
import { GenreBuilder } from "modules/genres/builder";
import { GenreRepository } from "modules/genres/repository";
import { MovieBuilder } from "modules/movies/builder";
import { MovieRepository } from "modules/movies/repository";
import { ReservationBuilder } from "modules/reservations/builder";
import {
  ReservationRepository,
  type IReservationRepository,
} from "modules/reservations/repository";
import { RoomBuilder } from "modules/rooms/builder";
import { RoomRepository } from "modules/rooms/repository";
import { SeatRepository } from "modules/seats/repository";
import type { Seat } from "modules/seats/types";
import { ShowtimeBuilder } from "modules/showtimes/builder";
import { ShowtimeRepository } from "modules/showtimes/repository";
import { UserBuilder } from "modules/users/builder";
import { UserRepository } from "modules/users/repository";
import type { User } from "modules/users/types";

describe("INTEGRATION: ReservationControler.list - GET /api/v1/reservations", () => {
  const reservationEndpoint = "/api/v1/reservations";

  let regularUserOne: User;
  let regularUserOneToken: string;

  let regularUserTwo: User;

  let savedRoomOne: Room;
  let savedSeatsForRoomOne: Seat[];

  let savedShowtimeOne: Showtime;

  let reservationRepository: IReservationRepository;

  beforeEach(async () => {
    await clearDatabase();

    const userRepository = new UserRepository();
    const regularUserOneBuilder = new UserBuilder().withNonAdminRole();
    regularUserOne = await regularUserOneBuilder.save(userRepository);
    regularUserOneToken = generateToken(regularUserOne);

    const regularUserTwoBuilder = new UserBuilder().withNonAdminRole();
    regularUserTwo = await regularUserTwoBuilder.save(userRepository);

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

    reservationRepository = new ReservationRepository();

    const userOneReservations = await new ReservationBuilder()
      .withUserId(regularUserOne.id)
      .withSeatIds([userOneSeatOne.id, userOneSeatTwo.id])
      .withShowtimeId(savedShowtimeOne.id)
      .save(reservationRepository);

    await new ReservationBuilder()
      .withUserId(regularUserTwo.id)
      .withSeatIds([userTwoSeatOne.id, userTwoSeatTwo.id])
      .withShowtimeId(savedShowtimeOne.id)
      .save(reservationRepository);

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
      .save(new UserRepository());
    const adminToken = generateToken(adminUser);

    const [
      userOneSeatOne,
      userOneSeatTwo,
      userTwoSeatOne,
      userTwoSeatTwo,
      ..._seatsRest
    ] = savedSeatsForRoomOne;

    reservationRepository = new ReservationRepository();

    const userOneReservations = await new ReservationBuilder()
      .withUserId(regularUserOne.id)
      .withSeatIds([userOneSeatOne.id, userOneSeatTwo.id])
      .withShowtimeId(savedShowtimeOne.id)
      .save(reservationRepository);

    const userTwoReservations = await new ReservationBuilder()
      .withUserId(regularUserTwo.id)
      .withSeatIds([userTwoSeatOne.id, userTwoSeatTwo.id])
      .withShowtimeId(savedShowtimeOne.id)
      .save(reservationRepository);

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

import { Logger } from "configs/loggers";
import { prisma } from "configs/prisma-client.config";
import { GenreBuilder } from "modules/genres/builder";
import { GenreRepository } from "modules/genres/repository";
import { MovieBuilder } from "modules/movies/builder";
import { MovieRepository } from "modules/movies/repository";
import { UserBuilder } from "modules/users/builder";
import { UserRepository } from "modules/users/repository";
import { genreMap, genreSeeds } from "./seed-data/genre.seed";
import { movieSeeds } from "./seed-data/movie.seed";
import { RoomBuilder } from "modules/rooms/builder";
import { SeatRepository } from "modules/seats/repository";
import { RoomRepository } from "modules/rooms/repository";
import { ShowtimeBuilder } from "modules/showtimes/builder";
import { ShowtimeRepository } from "modules/showtimes/repository";
import { ReservationBuilder } from "modules/reservations/builder";
import { ReservationRepository } from "modules/reservations/repository";

export async function clearDatabase() {
  await prisma.reservation.deleteMany();
  await prisma.user.deleteMany();
  await prisma.showtime.deleteMany();
  await prisma.movie.deleteMany();
  await prisma.genre.deleteMany();
  await prisma.seat.deleteMany();
  await prisma.room.deleteMany();
}

async function main() {
  await clearDatabase();
  const userRepository = new UserRepository();

  // Admin user
  const ADMIN_EMAIL = "admin@admin.com";
  const ADMIN_PASSWORD = "admin";
  const savedAdminUser = new UserBuilder()
    .withEmail(ADMIN_EMAIL)
    .withPassword(ADMIN_PASSWORD)
    .save(userRepository);

  Logger.info(
    `👑 saved admin user with email: ${ADMIN_EMAIL} and password: ${ADMIN_PASSWORD}`
  );

  // Regular users
  const NUMBER_OF_REGULAR_USERS_TO_SAVE = 10;
  const regularUserBuilder = new UserBuilder();
  regularUserBuilder.buildMany(NUMBER_OF_REGULAR_USERS_TO_SAVE, false);
  const savedRegularUsers = await regularUserBuilder.saveAll(userRepository);

  Logger.info(`👤 saved ${NUMBER_OF_REGULAR_USERS_TO_SAVE} regular users`);

  // Movies
  const savedGenres = await Promise.all(
    genreSeeds.map((genre) =>
      new GenreBuilder()
        .withUUID(genre.id)
        .withName(genre.name)
        .save(new GenreRepository())
    )
  );
  Logger.info(`🎬 saved ${savedGenres.length} genres`);

  const movieRepository = new MovieRepository();

  const savedMovies = await Promise.all(
    movieSeeds.map((movie) =>
      new MovieBuilder()
        .withUUID(movie.id)
        .withTitle(movie.title)
        .withDescription(movie.description)
        .withPosterUrl(movie.posterUrl)
        .withGenreId(genreMap[movie.genreName])
        .save(movieRepository)
    )
  );
  Logger.info(`🎬 saved ${savedMovies.length} movies`);

  // Rooms and Seats
  const NUMBER_OF_ROOMS_TO_SAVE = movieSeeds.length;
  const roomRepository = new RoomRepository();
  const seatRepository = new SeatRepository();

  const savedRoomsWithSeats = await Promise.all(
    Array.from({ length: NUMBER_OF_ROOMS_TO_SAVE }).map((_value, index) =>
      new RoomBuilder()
        .withNumber(index + 1)
        .withName(`Room ${index + 1}`)
        .generateSeats(2, 2)
        .save(roomRepository, seatRepository)
    )
  );

  const savedRooms = savedRoomsWithSeats.map(
    (roomWithSeats) => roomWithSeats.room
  );

  const savedSeats = savedRoomsWithSeats
    .map((roomWithSeats) => roomWithSeats.seats)
    .flat();

  Logger.info(`🏠 saved ${savedRooms.length} rooms`);
  Logger.info(`🎒 saved ${savedSeats.length} seats`);

  // Showtimes
  const NUMBER_OF_SHOWTIMES_PER_MOVIE_TO_SAVE = 5;
  const savedShowtimesArr = [];
  for (let i = 0; i < savedMovies.length; i++) {
    const showtimeBuilder = new ShowtimeBuilder();
    showtimeBuilder.buildMany(
      movieSeeds[i].id,
      savedRooms[i].id,
      NUMBER_OF_SHOWTIMES_PER_MOVIE_TO_SAVE,
      new Date(),
      120
    );
    const savedShowtimes = await showtimeBuilder.saveAll(
      new ShowtimeRepository()
    );
    savedShowtimesArr.push(savedShowtimes);
  }

  Logger.info(`🎬 saved ${savedShowtimesArr.flat().length} showtimes`);

  const reservationRepository = new ReservationRepository();
  const savedReservationsShowtime1 = await new ReservationBuilder()
    .withSeatIds([savedSeats[0].id, savedSeats[1].id])
    .withUserId(savedRegularUsers[0].id)
    .withShowtimeId(savedShowtimesArr.flat()[0].id)
    .withAmountPaid(100)
    .save(reservationRepository);

  const savedReservationsShowtime2 = await new ReservationBuilder()
    .withSeatIds([savedSeats[4].id, savedSeats[5].id])
    .withUserId(savedRegularUsers[1].id)
    .withShowtimeId(savedShowtimesArr.flat()[1].id)
    .withAmountPaid(120)
    .save(reservationRepository);

  const savedReservationsShowtime3 = await new ReservationBuilder()
    .withSeatIds([savedSeats[8].id, savedSeats[9].id])
    .withUserId(savedRegularUsers[2].id)
    .withShowtimeId(savedShowtimesArr.flat()[2].id)
    .withAmountPaid(120)
    .save(reservationRepository);

  const savedReservations = savedReservationsShowtime1.concat(
    savedReservationsShowtime2,
    savedReservationsShowtime3
  );
  Logger.info(`🎫 saved ${savedReservations.length} reservations`);
}

const initialTimer = new Date().getTime();
main()
  .then(async () => {
    const endTimer = new Date().getTime();
    // eslint-disable-next-line no-console
    console.log(`\n\n⏱️ Time to seed: ${endTimer - initialTimer}ms`);
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    Logger.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

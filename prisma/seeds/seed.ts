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

  // Rooms
  const NUMBER_OF_ROOMS_TO_SAVE = 10;

  const roomBuilder = new RoomBuilder();
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

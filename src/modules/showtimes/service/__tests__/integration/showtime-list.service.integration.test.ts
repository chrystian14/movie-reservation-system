import { MAX_PER_PAGE_NUMBER } from "modules/_shared/pagination/pagination.middleware";
import { GenreBuilder } from "modules/genres/builder";
import { GenreRepository } from "modules/genres/repository";
import { MovieBuilder } from "modules/movies/builder";
import { MovieRepository } from "modules/movies/repository";
import { RoomBuilder } from "modules/rooms/builder";
import { RoomRepository } from "modules/rooms/repository";
import { SeatRepository } from "modules/seats/repository";
import { ShowtimeBuilder } from "modules/showtimes/builder";
import { ShowtimeService } from "../../showtime.service";
import { ShowtimeRepository } from "modules/showtimes/repository";
import { clearDatabase } from "modules/_shared/tests/clear-database";

describe("UNIT: ShowtimeService.list", () => {
  beforeEach(async () => {
    await clearDatabase();
  });

  test("should return only the refered paginated showtimes ordered by datetime desc", async () => {
    const savedGenre = await new GenreBuilder().save(new GenreRepository());
    const savedMovie = await new MovieBuilder()
      .withGenreId(savedGenre.id)
      .save(new MovieRepository());

    const { room: savedRoom, seats: _savedSeats } = await new RoomBuilder()
      .generateSeats(5, 5)
      .save(new RoomRepository(), new SeatRepository());

    const showtimeBuilder = new ShowtimeBuilder();
    showtimeBuilder.buildMany(
      savedMovie.id,
      savedRoom.id,
      MAX_PER_PAGE_NUMBER * 3,
      new Date(),
      60
    );
    const savedShowtimes = await showtimeBuilder.saveAll(
      new ShowtimeRepository()
    );

    const showtimeService = new ShowtimeService(
      new ShowtimeRepository(),
      new RoomRepository(),
      new MovieRepository(),
      new SeatRepository()
    );

    const resultedList = await showtimeService.list(
      undefined,
      1,
      MAX_PER_PAGE_NUMBER
    );

    const savedShowtimesDescOrdered = savedShowtimes.toSorted(
      (a, b) => b.datetime.getTime() - a.datetime.getTime()
    );
    const expectedList = savedShowtimesDescOrdered.slice(
      0,
      MAX_PER_PAGE_NUMBER
    );

    expect(resultedList.length).toBe(MAX_PER_PAGE_NUMBER);
    expect(resultedList).toEqual(expectedList);
  });
});

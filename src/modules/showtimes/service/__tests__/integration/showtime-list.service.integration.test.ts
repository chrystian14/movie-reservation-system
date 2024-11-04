import { MAX_PER_PAGE_NUMBER } from "modules/_shared/pagination/pagination.middleware";
import { GenreBuilder } from "modules/genres/builder";
import { GenreDao } from "modules/genres/dao";
import { MovieBuilder } from "modules/movies/builder";
import { MovieDao } from "modules/movies/dao";
import { RoomBuilder } from "modules/rooms/builder";
import { RoomDao } from "modules/rooms/dao";
import { SeatDao } from "modules/seats/dao";
import { ShowtimeBuilder } from "modules/showtimes/builder";
import { ShowtimeService } from "../../showtime.service";
import { ShowtimeDao } from "modules/showtimes/dao";
import { clearDatabase } from "modules/_shared/tests/clear-database";

describe("UNIT: ShowtimeService.list", () => {
  beforeEach(async () => {
    await clearDatabase();
  });

  test("should return only the refered paginated showtimes ordered by datetime desc", async () => {
    const savedGenre = await new GenreBuilder().save(new GenreDao());
    const savedMovie = await new MovieBuilder()
      .withGenreId(savedGenre.id)
      .save(new MovieDao());

    const { room: savedRoom, seats: _savedSeats } = await new RoomBuilder()
      .generateSeats(5, 5)
      .save(new RoomDao(), new SeatDao());

    const showtimeBuilder = new ShowtimeBuilder();
    showtimeBuilder.buildMany(
      savedMovie.id,
      savedRoom.id,
      MAX_PER_PAGE_NUMBER * 3,
      new Date(),
      60
    );
    const savedShowtimes = await showtimeBuilder.saveAll(new ShowtimeDao());

    const showtimeService = new ShowtimeService(
      new ShowtimeDao(),
      new RoomDao(),
      new MovieDao(),
      new SeatDao()
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

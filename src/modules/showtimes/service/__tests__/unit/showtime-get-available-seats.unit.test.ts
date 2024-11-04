import { ShowtimeDao, type IShowtimeDao } from "modules/showtimes/dao";
import {
  ShowtimeService,
  type IShowtimeService,
} from "modules/showtimes/service";
import { RoomDao, type IRoomDao } from "modules/rooms/dao";
import { MovieDao, type IMovieDao } from "modules/movies/dao";
import { SeatDao, type ISeatDao } from "modules/seats/dao";
import { randomUUID } from "crypto";

jest.mock("modules/seats/dao/seat.dao.ts");
jest.mock("modules/showtimes/dao/showtime.dao.ts");
jest.mock("modules/rooms/dao/room.dao.ts");
jest.mock("modules/movies/dao/movie.dao.ts");

describe("UNIT: ShowtimeService.getAvailableSeats", () => {
  let showtimeService: IShowtimeService;

  let mockedSeatDao: jest.Mocked<ISeatDao>;
  let mockedShowtimeDao: jest.Mocked<IShowtimeDao>;
  let mockedRoomDao: jest.Mocked<IRoomDao>;
  let mockedMovieDao: jest.Mocked<IMovieDao>;

  beforeEach(() => {
    mockedSeatDao = jest.mocked(new SeatDao());
    mockedShowtimeDao = jest.mocked(new ShowtimeDao());
    mockedRoomDao = jest.mocked(new RoomDao());
    mockedMovieDao = jest.mocked(new MovieDao());

    showtimeService = new ShowtimeService(
      mockedShowtimeDao,
      mockedRoomDao,
      mockedMovieDao,
      mockedSeatDao
    );
  });

  test("should throw an error when getting available seats from a non existing showtime id", async () => {
    mockedShowtimeDao.countById.mockResolvedValueOnce(0);

    const nonExistingShowtimeId = randomUUID();
    await expect(
      showtimeService.getAvailableSeats(nonExistingShowtimeId)
    ).rejects.toThrow("Showtime not found");

    expect(mockedShowtimeDao.countById).toHaveBeenCalledTimes(1);
    expect(mockedShowtimeDao.countById).toHaveBeenCalledWith(
      nonExistingShowtimeId
    );

    expect(mockedSeatDao.getAvailableSeats).not.toHaveBeenCalled();
  });
});

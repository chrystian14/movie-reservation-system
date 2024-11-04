import { ShowtimeDao, type IShowtimeDao } from "modules/showtimes/dao";
import type { ShowtimeCreateInput } from "modules/showtimes/types";
import {
  ShowtimeService,
  type IShowtimeService,
} from "modules/showtimes/service";
import { ShowtimeBuilder } from "modules/showtimes/builder";
import { RoomDao, type IRoomDao } from "modules/rooms/dao";
import { MovieDao, type IMovieDao } from "modules/movies/dao";
import { SeatDao, type ISeatDao } from "modules/seats/dao";

jest.mock("modules/seats/dao/seat.dao.ts");
jest.mock("modules/showtimes/dao/showtime.dao.ts");
jest.mock("modules/rooms/dao/room.dao.ts");
jest.mock("modules/movies/dao/movie.dao.ts");

describe("UNIT: ShowtimeService.create", () => {
  let showtimeCreateInput: ShowtimeCreateInput;
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

    showtimeCreateInput = new ShowtimeBuilder().requiredForCreation();
  });

  test("should throw an error if creating a showtime with non-existent room id", async () => {
    mockedRoomDao.countById.mockResolvedValueOnce(0);

    await expect(showtimeService.create(showtimeCreateInput)).rejects.toThrow(
      "Room not found"
    );

    expect(mockedRoomDao.countById).toHaveBeenCalledTimes(1);
    expect(mockedRoomDao.countById).toHaveBeenCalledWith(
      showtimeCreateInput.roomId
    );

    expect(mockedShowtimeDao.create).not.toHaveBeenCalled();
  });

  test("should throw an error if creating a showtime with non-existent movie id", async () => {
    mockedRoomDao.countById.mockResolvedValueOnce(1);
    mockedMovieDao.countById.mockResolvedValueOnce(0);

    await expect(showtimeService.create(showtimeCreateInput)).rejects.toThrow(
      "Movie not found"
    );

    expect(mockedRoomDao.countById).toHaveBeenCalledTimes(1);
    expect(mockedRoomDao.countById).toHaveBeenCalledWith(
      showtimeCreateInput.roomId
    );

    expect(mockedMovieDao.countById).toHaveBeenCalledTimes(1);
    expect(mockedMovieDao.countById).toHaveBeenCalledWith(
      showtimeCreateInput.movieId
    );

    expect(mockedShowtimeDao.create).not.toHaveBeenCalled();
  });
});

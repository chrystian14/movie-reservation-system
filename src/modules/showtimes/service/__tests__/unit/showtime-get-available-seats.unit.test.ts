import {
  ShowtimeRepository,
  type IShowtimeRepository,
} from "modules/showtimes/repository";
import {
  ShowtimeService,
  type IShowtimeService,
} from "modules/showtimes/service";
import { RoomRepository, type IRoomRepository } from "modules/rooms/repository";
import {
  MovieRepository,
  type IMovieRepository,
} from "modules/movies/repository";
import { SeatRepository, type ISeatRepository } from "modules/seats/repository";
import { randomUUID } from "crypto";

jest.mock("modules/seats/repository/seat.repository.ts");
jest.mock("modules/showtimes/repository/showtime.repository.ts");
jest.mock("modules/rooms/repository/room.repository.ts");
jest.mock("modules/movies/repository/movie.repository.ts");

describe("UNIT: ShowtimeService.getAvailableSeats", () => {
  let showtimeService: IShowtimeService;

  let mockedSeatRepository: jest.Mocked<ISeatRepository>;
  let mockedShowtimeRepository: jest.Mocked<IShowtimeRepository>;
  let mockedRoomRepository: jest.Mocked<IRoomRepository>;
  let mockedMovieRepository: jest.Mocked<IMovieRepository>;

  beforeEach(() => {
    mockedSeatRepository = jest.mocked(new SeatRepository());
    mockedShowtimeRepository = jest.mocked(new ShowtimeRepository());
    mockedRoomRepository = jest.mocked(new RoomRepository());
    mockedMovieRepository = jest.mocked(new MovieRepository());

    showtimeService = new ShowtimeService(
      mockedShowtimeRepository,
      mockedRoomRepository,
      mockedMovieRepository,
      mockedSeatRepository
    );
  });

  test("should throw an error when getting available seats from a non existing showtime id", async () => {
    mockedShowtimeRepository.countById.mockResolvedValueOnce(0);

    const nonExistingShowtimeId = randomUUID();
    await expect(
      showtimeService.getAvailableSeats(nonExistingShowtimeId)
    ).rejects.toThrow("Showtime not found");

    expect(mockedShowtimeRepository.countById).toHaveBeenCalledTimes(1);
    expect(mockedShowtimeRepository.countById).toHaveBeenCalledWith(
      nonExistingShowtimeId
    );

    expect(mockedSeatRepository.getAvailableSeats).not.toHaveBeenCalled();
  });
});

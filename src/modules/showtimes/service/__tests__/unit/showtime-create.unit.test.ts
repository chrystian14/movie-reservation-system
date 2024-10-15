import {
  ShowtimeRepository,
  type IShowtimeRepository,
} from "modules/showtimes/repository";
import type { ShowtimeCreateInput } from "modules/showtimes/types";
import {
  ShowtimeService,
  type IShowtimeService,
} from "modules/showtimes/service";
import { ShowtimeBuilder } from "modules/showtimes/builder";
import { RoomRepository, type IRoomRepository } from "modules/rooms/repository";
import {
  MovieRepository,
  type IMovieRepository,
} from "modules/movies/repository";

jest.mock("modules/showtimes/repository/showtime.repository.ts");
jest.mock("modules/rooms/repository/room.repository.ts");
jest.mock("modules/movies/repository/movie.repository.ts");

describe("UNIT: ShowtimeService.create", () => {
  let showtimeCreateInput: ShowtimeCreateInput;
  let showtimeService: IShowtimeService;

  let mockedShowtimeRepository: jest.Mocked<IShowtimeRepository>;
  let mockedRoomRepository: jest.Mocked<IRoomRepository>;
  let mockedMovieRepository: jest.Mocked<IMovieRepository>;

  beforeEach(() => {
    mockedShowtimeRepository = jest.mocked(new ShowtimeRepository());
    mockedRoomRepository = jest.mocked(new RoomRepository());
    mockedMovieRepository = jest.mocked(new MovieRepository());

    showtimeService = new ShowtimeService(
      mockedShowtimeRepository,
      mockedRoomRepository,
      mockedMovieRepository
    );

    showtimeCreateInput = new ShowtimeBuilder().requiredForCreation();
  });

  test("should throw an error if creating a showtime with non-existent room id", async () => {
    mockedRoomRepository.countById.mockResolvedValue(0);

    await expect(showtimeService.create(showtimeCreateInput)).rejects.toThrow(
      "Room not found"
    );

    expect(mockedRoomRepository.countById).toHaveBeenCalledTimes(1);
    expect(mockedRoomRepository.countById).toHaveBeenCalledWith(
      showtimeCreateInput.roomId
    );

    expect(mockedShowtimeRepository.create).not.toHaveBeenCalled();
  });
});

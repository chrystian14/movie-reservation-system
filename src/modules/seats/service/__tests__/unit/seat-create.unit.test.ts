import { RoomRepository, type IRoomRepository } from "modules/rooms/repository";
import { SeatRepository, type ISeatRepository } from "modules/seats/repository";
import type { SeatCreateInput } from "modules/seats/types";
import type { ISeatService } from "../../seat.service.interface";
import { SeatService } from "../../seat.service";

jest.mock("modules/rooms/repository/room.repository.ts");
jest.mock("modules/seats/repository/seat.repository.ts");

describe("UNIT: SeatService.create", () => {
  let seatCreateInput: SeatCreateInput;
  let seatService: ISeatService;

  let mockedSeatRepository: jest.Mocked<ISeatRepository>;
  let mockedRoomRepository: jest.Mocked<IRoomRepository>;

  beforeEach(() => {
    mockedSeatRepository = jest.mocked(new SeatRepository());
    mockedRoomRepository = jest.mocked(new RoomRepository());

    seatService = new SeatService(mockedSeatRepository, mockedRoomRepository);
  });

  test("should throw an error if creating a seat with non-existent room id", async () => {
    mockedRoomRepository.countById.mockResolvedValue(0);

    await expect(seatService.create(seatCreateInput)).rejects.toThrow(
      "Room not found"
    );

    expect(mockedRoomRepository.countById).toHaveBeenCalledTimes(1);
    expect(mockedRoomRepository.countById).toHaveBeenCalledWith(
      seatCreateInput.roomId
    );

    expect(mockedSeatRepository.create).not.toHaveBeenCalled();
  });
});

import { RoomDao, type IRoomDao } from "modules/rooms/dao";
import { SeatDao, type ISeatDao } from "modules/seats/dao";
import type { SeatCreateInput } from "modules/seats/types";
import type { ISeatService } from "../../seat.service.interface";
import { SeatService } from "../../seat.service";
import { SeatBuilder } from "modules/seats/builder";

jest.mock("modules/rooms/dao/room.dao.ts");
jest.mock("modules/seats/dao/seat.dao.ts");

describe("UNIT: SeatService.create", () => {
  let seatCreateInput: SeatCreateInput;
  let seatService: ISeatService;

  let mockedSeatDao: jest.Mocked<ISeatDao>;
  let mockedRoomDao: jest.Mocked<IRoomDao>;

  beforeEach(() => {
    mockedSeatDao = jest.mocked(new SeatDao());
    mockedRoomDao = jest.mocked(new RoomDao());

    seatCreateInput = new SeatBuilder().requiredForCreation();

    seatService = new SeatService(mockedSeatDao, mockedRoomDao);
  });

  test("should throw an error if creating a seat with non-existent room id", async () => {
    mockedRoomDao.countById.mockResolvedValue(0);

    await expect(seatService.create(seatCreateInput)).rejects.toThrow(
      "Room not found"
    );

    expect(mockedRoomDao.countById).toHaveBeenCalledTimes(1);
    expect(mockedRoomDao.countById).toHaveBeenCalledWith(
      seatCreateInput.roomId
    );

    expect(mockedSeatDao.create).not.toHaveBeenCalled();
  });

  test("should throw an error if seat column and row already taken", async () => {
    mockedRoomDao.countById.mockResolvedValueOnce(1);
    mockedSeatDao.countByColumnAndRowByRoomId.mockResolvedValueOnce(1);

    await expect(seatService.create(seatCreateInput)).rejects.toThrow(
      "Seat column and row already taken"
    );

    expect(mockedSeatDao.countByColumnAndRowByRoomId).toHaveBeenCalledTimes(1);
    expect(mockedSeatDao.countByColumnAndRowByRoomId).toHaveBeenCalledWith(
      seatCreateInput.column,
      seatCreateInput.row,
      seatCreateInput.roomId
    );

    expect(mockedSeatDao.create).not.toHaveBeenCalled();
  });
});

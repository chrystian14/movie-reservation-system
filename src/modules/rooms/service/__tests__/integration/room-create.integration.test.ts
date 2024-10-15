import { RoomRepository, type IRoomRepository } from "modules/rooms/repository";
import { RoomService } from "../../room.service";
import type { IRoomService } from "../../room.service.interface";
import type { RoomCreateInput } from "modules/rooms/types";
import { RoomBuilder } from "modules/rooms/builder";
import { SeatRepository, type ISeatRepository } from "modules/seats/repository";
import { clearDatabase } from "configs/jest-setup.config";

describe("INTEGRATION: RoomService.create", () => {
  let roomRepository: IRoomRepository;
  let roomService: IRoomService;
  let roomCreateInput: RoomCreateInput;

  let seatRepository: ISeatRepository;

  beforeEach(async () => {
    await clearDatabase();

    seatRepository = new SeatRepository();

    roomRepository = new RoomRepository();
    roomService = new RoomService(roomRepository);

    const roomBuilder = new RoomBuilder();
    roomCreateInput = roomBuilder.requiredForCreation();
  });

  test("should create a room with correct amount of seats", async () => {
    const room = await roomService.create(roomCreateInput);

    const actualSeatCount = await seatRepository.countByRoomId(room.id);
    const expectedSeatCount = roomCreateInput.columns * roomCreateInput.rows;
    expect(actualSeatCount).toBe(expectedSeatCount);

    const actualRoomCount = await roomRepository.countById(room.id);
    const expectedRoomCount = 1;
    expect(actualRoomCount).toBe(expectedRoomCount);
  });
});

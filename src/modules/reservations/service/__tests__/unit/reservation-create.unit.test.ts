import {
  ReservationRepository,
  type IReservationRepository,
} from "modules/reservations/repository";
import type { ReservationCreateInput } from "modules/reservations/types";
import {
  ReservationService,
  type IReservationService,
} from "modules/reservations/service";
import { ReservationBuilder } from "modules/reservations/builder";
import {
  ShowtimeRepository,
  type IShowtimeRepository,
} from "modules/showtimes/repository";
import { SeatRepository, type ISeatRepository } from "modules/seats/repository";
import { UserRepository, type IUserRepository } from "modules/users/repository";
import { ShowtimeBuilder } from "modules/showtimes/builder";
import { SeatBuilder } from "modules/seats/builder";

jest.mock("modules/reservations/repository/reservation.repository.ts");
jest.mock("modules/showtimes/repository/showtime.repository.ts");
jest.mock("modules/seats/repository/seat.repository.ts");
jest.mock("modules/users/repository/user.repository.ts");

describe("UNIT: ReservationService.create", () => {
  let reservationCreateInput: ReservationCreateInput;
  let reservationService: IReservationService;

  let mockedReservationRepository: jest.Mocked<IReservationRepository>;
  let mockedShowtimeRepository: jest.Mocked<IShowtimeRepository>;
  let mockedSeatRepository: jest.Mocked<ISeatRepository>;
  let mockedUserRepository: jest.Mocked<IUserRepository>;

  beforeEach(() => {
    mockedReservationRepository = jest.mocked(new ReservationRepository());
    mockedShowtimeRepository = jest.mocked(new ShowtimeRepository());
    mockedSeatRepository = jest.mocked(new SeatRepository());
    mockedUserRepository = jest.mocked(new UserRepository());

    reservationService = new ReservationService(
      mockedReservationRepository,
      mockedShowtimeRepository,
      mockedSeatRepository,
      mockedUserRepository
    );

    reservationCreateInput = new ReservationBuilder().requiredForCreation();
  });

  test("should throw an error if creating a reservation with non-existing showtime id", async () => {
    mockedShowtimeRepository.findById.mockResolvedValueOnce(null);

    await expect(
      reservationService.create(reservationCreateInput)
    ).rejects.toThrow("Showtime not found");

    expect(mockedShowtimeRepository.findById).toHaveBeenCalledTimes(1);
    expect(mockedShowtimeRepository.findById).toHaveBeenCalledWith(
      reservationCreateInput.showtimeId
    );

    expect(mockedReservationRepository.create).not.toHaveBeenCalled();
  });

  test("should throw an error if creating a reservation with non-existing user id", async () => {
    mockedShowtimeRepository.findById.mockResolvedValueOnce(
      new ShowtimeBuilder().build()
    );
    mockedUserRepository.countById.mockResolvedValueOnce(0);

    await expect(
      reservationService.create(reservationCreateInput)
    ).rejects.toThrow("User not found");

    expect(mockedUserRepository.countById).toHaveBeenCalledTimes(1);
    expect(mockedUserRepository.countById).toHaveBeenCalledWith(
      reservationCreateInput.userId
    );

    expect(mockedReservationRepository.create).not.toHaveBeenCalled();
  });

  test("should throw an error if creating a reservation with seatIds that are not in the showtime", async () => {
    mockedShowtimeRepository.findById.mockResolvedValueOnce(
      new ShowtimeBuilder().build()
    );
    mockedUserRepository.countById.mockResolvedValueOnce(1);
    mockedSeatRepository.scanForSeatsInRoom.mockResolvedValueOnce([]);

    await expect(
      reservationService.create(reservationCreateInput)
    ).rejects.toThrow("Seat(s) not found in showtime room");
  });

  test("should throw an error if creating a reservation for a seat that is already reserved", async () => {
    mockedShowtimeRepository.findById.mockResolvedValueOnce(
      new ShowtimeBuilder().build()
    );
    mockedUserRepository.countById.mockResolvedValueOnce(1);

    const [resevedSeatOne, reservedSeatTwo] = [
      new SeatBuilder().build(),
      new SeatBuilder().build(),
    ];

    const reservedSeatsIds: [string, ...string[]] = [
      resevedSeatOne.id,
      reservedSeatTwo.id,
    ];

    const reservationCreateInputAlreadyReservedSeats: ReservationCreateInput =
      new ReservationBuilder()
        .withSeatIds(reservedSeatsIds)
        .requiredForCreation();

    mockedSeatRepository.scanForSeatsInRoom.mockResolvedValueOnce([
      resevedSeatOne,
      reservedSeatTwo,
    ]);
    mockedSeatRepository.scanForReservedSeatsByShowtimeId.mockResolvedValueOnce(
      reservedSeatsIds
    );

    await expect(
      reservationService.create(reservationCreateInputAlreadyReservedSeats)
    ).rejects.toThrow("Seat(s) already reserved");
  });
});

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
import { randomUUID } from "crypto";

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
    mockedShowtimeRepository.countById.mockResolvedValueOnce(0);

    await expect(
      reservationService.create(reservationCreateInput)
    ).rejects.toThrow("Showtime not found");

    expect(mockedShowtimeRepository.countById).toHaveBeenCalledTimes(1);
    expect(mockedShowtimeRepository.countById).toHaveBeenCalledWith(
      reservationCreateInput.showtimeId
    );

    expect(mockedReservationRepository.create).not.toHaveBeenCalled();
  });

  test("should throw an error if creating a reservation with non-existing user id", async () => {
    mockedShowtimeRepository.countById.mockResolvedValueOnce(1);
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

  test("should throw an error if creating a reservation for a seat that is already reserved", async () => {
    mockedShowtimeRepository.countById.mockResolvedValueOnce(1);
    mockedUserRepository.countById.mockResolvedValueOnce(1);

    const seatsAlreadyReserved = 4;
    const reservedSeatsIds = Array.from({ length: seatsAlreadyReserved }, () =>
      randomUUID()
    );

    mockedSeatRepository.scanForReservedSeatsByShowtimeId.mockResolvedValueOnce(
      reservedSeatsIds
    );

    await expect(
      reservationService.create(reservationCreateInput)
    ).rejects.toThrow("Seat(s) already reserved");
  });
});

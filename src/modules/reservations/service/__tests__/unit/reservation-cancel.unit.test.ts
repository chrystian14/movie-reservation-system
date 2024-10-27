import {
  ReservationRepository,
  type IReservationRepository,
} from "modules/reservations/repository";
import {
  ReservationService,
  type IReservationService,
} from "modules/reservations/service";
import {
  ShowtimeRepository,
  type IShowtimeRepository,
} from "modules/showtimes/repository";
import { SeatRepository, type ISeatRepository } from "modules/seats/repository";
import { UserRepository, type IUserRepository } from "modules/users/repository";
import { randomUUID } from "crypto";
import { ReservationBuilder } from "modules/reservations/builder";

jest.mock("modules/reservations/repository/reservation.repository.ts");
jest.mock("modules/showtimes/repository/showtime.repository.ts");
jest.mock("modules/seats/repository/seat.repository.ts");
jest.mock("modules/users/repository/user.repository.ts");

describe("UNIT: ReservationService.cancel", () => {
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
  });

  test("should throw an error if canceling a reservation with non-existing reservation id", async () => {
    mockedReservationRepository.findById.mockResolvedValueOnce(null);

    const mockedReservationId = randomUUID();
    const mockedUserId = randomUUID();
    await expect(
      reservationService.cancel(mockedReservationId, mockedUserId)
    ).rejects.toThrow("Reservation not found");

    expect(mockedReservationRepository.findById).toHaveBeenCalledTimes(1);
    expect(mockedReservationRepository.findById).toHaveBeenCalledWith(
      mockedReservationId
    );

    expect(mockedReservationRepository.cancel).not.toHaveBeenCalled();
  });

  test("should throw an error if canceling a reservation with non-existing user id", async () => {
    const mockedReservation = new ReservationBuilder().build();
    mockedReservationRepository.findById.mockResolvedValueOnce(
      mockedReservation
    );

    mockedUserRepository.countById.mockResolvedValueOnce(0);

    await expect(
      reservationService.cancel(mockedReservation.id, mockedReservation.userId)
    ).rejects.toThrow("User not found");

    expect(mockedReservationRepository.findById).toHaveBeenCalledTimes(1);
    expect(mockedReservationRepository.findById).toHaveBeenCalledWith(
      mockedReservation.id
    );

    expect(mockedUserRepository.countById).toHaveBeenCalledTimes(1);
    expect(mockedUserRepository.countById).toHaveBeenCalledWith(
      mockedReservation.userId
    );

    expect(mockedReservationRepository.cancel).not.toHaveBeenCalled();
  });
});

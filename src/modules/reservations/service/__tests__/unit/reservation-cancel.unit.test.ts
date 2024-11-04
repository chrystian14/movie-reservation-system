import { ReservationDao, type IReservationDao } from "modules/reservations/dao";
import {
  ReservationService,
  type IReservationService,
} from "modules/reservations/service";
import { ShowtimeDao, type IShowtimeDao } from "modules/showtimes/dao";
import { SeatDao, type ISeatDao } from "modules/seats/dao";
import { UserDao, type IUserDao } from "modules/users/dao";
import { randomUUID } from "crypto";
import { ReservationBuilder } from "modules/reservations/builder";
import { ShowtimeBuilder } from "modules/showtimes/builder";

jest.mock("modules/reservations/dao/reservation.dao.ts");
jest.mock("modules/showtimes/dao/showtime.dao.ts");
jest.mock("modules/seats/dao/seat.dao.ts");
jest.mock("modules/users/dao/user.dao.ts");

describe("UNIT: ReservationService.cancel", () => {
  let reservationService: IReservationService;

  let mockedReservationDao: jest.Mocked<IReservationDao>;
  let mockedShowtimeDao: jest.Mocked<IShowtimeDao>;
  let mockedSeatDao: jest.Mocked<ISeatDao>;
  let mockedUserDao: jest.Mocked<IUserDao>;

  beforeEach(() => {
    mockedReservationDao = jest.mocked(new ReservationDao());
    mockedShowtimeDao = jest.mocked(new ShowtimeDao());
    mockedSeatDao = jest.mocked(new SeatDao());
    mockedUserDao = jest.mocked(new UserDao());

    reservationService = new ReservationService(
      mockedReservationDao,
      mockedShowtimeDao,
      mockedSeatDao,
      mockedUserDao
    );
  });

  test("should throw an error if canceling a reservation with non-existing reservation id", async () => {
    mockedReservationDao.findById.mockResolvedValueOnce(null);

    const mockedReservationId = randomUUID();
    const mockedUserId = randomUUID();
    await expect(
      reservationService.cancel(mockedReservationId, mockedUserId)
    ).rejects.toThrow("Reservation not found");

    expect(mockedReservationDao.findById).toHaveBeenCalledTimes(1);
    expect(mockedReservationDao.findById).toHaveBeenCalledWith(
      mockedReservationId
    );

    expect(mockedReservationDao.cancel).not.toHaveBeenCalled();
  });

  test("should throw an error if canceling a reservation with non-existing user id", async () => {
    const mockedReservation = new ReservationBuilder().build();
    mockedReservationDao.findById.mockResolvedValueOnce(mockedReservation);

    mockedUserDao.countById.mockResolvedValueOnce(0);

    await expect(
      reservationService.cancel(mockedReservation.id, mockedReservation.userId)
    ).rejects.toThrow("User not found");

    expect(mockedReservationDao.findById).toHaveBeenCalledTimes(1);
    expect(mockedReservationDao.findById).toHaveBeenCalledWith(
      mockedReservation.id
    );

    expect(mockedUserDao.countById).toHaveBeenCalledTimes(1);
    expect(mockedUserDao.countById).toHaveBeenCalledWith(
      mockedReservation.userId
    );

    expect(mockedReservationDao.cancel).not.toHaveBeenCalled();
  });

  test("should throw an error if user is not the owner of the reservation", async () => {
    const mockedReservation = new ReservationBuilder().build();
    mockedReservationDao.findById.mockResolvedValueOnce(mockedReservation);

    mockedUserDao.countById.mockResolvedValueOnce(1);

    const mockedDifferentUserId = randomUUID();
    await expect(
      reservationService.cancel(mockedReservation.id, mockedDifferentUserId)
    ).rejects.toThrow("You don't have permission to perform this action");

    expect(mockedReservationDao.findById).toHaveBeenCalledTimes(1);
    expect(mockedReservationDao.findById).toHaveBeenCalledWith(
      mockedReservation.id
    );

    expect(mockedUserDao.countById).toHaveBeenCalledTimes(1);
    expect(mockedUserDao.countById).toHaveBeenCalledWith(mockedDifferentUserId);

    expect(mockedReservationDao.cancel).not.toHaveBeenCalled();
  });

  test("should throw an error if user is the owner of the reservation but the reservation is from past", async () => {
    const mockedReservation = new ReservationBuilder().build();
    mockedReservationDao.findById.mockResolvedValueOnce(mockedReservation);

    mockedUserDao.countById.mockResolvedValueOnce(1);

    const mockedPastDate = new Date(
      Date.now() - 1 * 24 * 60 * 60 * 1000
    ).toISOString();
    const mockedShowtime = new ShowtimeBuilder()
      .withIsoDatetime(mockedPastDate)
      .build();
    mockedShowtimeDao.findById.mockResolvedValueOnce(mockedShowtime);

    await expect(
      reservationService.cancel(mockedReservation.id, mockedReservation.userId)
    ).rejects.toThrow("Cannot cancel a reservation from a past showtime");

    expect(mockedReservationDao.findById).toHaveBeenCalledTimes(1);
    expect(mockedReservationDao.findById).toHaveBeenCalledWith(
      mockedReservation.id
    );

    expect(mockedUserDao.countById).toHaveBeenCalledTimes(1);
    expect(mockedUserDao.countById).toHaveBeenCalledWith(
      mockedReservation.userId
    );

    expect(mockedShowtimeDao.findById).toHaveBeenCalledTimes(1);
    expect(mockedShowtimeDao.findById).toHaveBeenCalledWith(
      mockedReservation.showtimeId
    );

    expect(mockedReservationDao.cancel).not.toHaveBeenCalled();
  });
});

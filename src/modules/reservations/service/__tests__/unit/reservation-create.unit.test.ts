import { ReservationDao, type IReservationDao } from "modules/reservations/dao";
import type { ReservationCreateInput } from "modules/reservations/types";
import {
  ReservationService,
  type IReservationService,
} from "modules/reservations/service";
import { ReservationBuilder } from "modules/reservations/builder";
import { ShowtimeDao, type IShowtimeDao } from "modules/showtimes/dao";
import { SeatDao, type ISeatDao } from "modules/seats/dao";
import { UserDao, type IUserDao } from "modules/users/dao";
import { ShowtimeBuilder } from "modules/showtimes/builder";
import { SeatBuilder } from "modules/seats/builder";

jest.mock("modules/reservations/dao/reservation.dao.ts");
jest.mock("modules/showtimes/dao/showtime.dao.ts");
jest.mock("modules/seats/dao/seat.dao.ts");
jest.mock("modules/users/dao/user.dao.ts");

describe("UNIT: ReservationService.create", () => {
  let reservationCreateInput: ReservationCreateInput;
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

    reservationCreateInput = new ReservationBuilder().requiredForCreation();
  });

  test("should throw an error if creating a reservation with non-existing showtime id", async () => {
    mockedShowtimeDao.findById.mockResolvedValueOnce(null);

    await expect(
      reservationService.create(reservationCreateInput)
    ).rejects.toThrow("Showtime not found");

    expect(mockedShowtimeDao.findById).toHaveBeenCalledTimes(1);
    expect(mockedShowtimeDao.findById).toHaveBeenCalledWith(
      reservationCreateInput.showtimeId
    );

    expect(mockedReservationDao.create).not.toHaveBeenCalled();
  });

  test("should throw an error if creating a reservation with non-existing user id", async () => {
    mockedShowtimeDao.findById.mockResolvedValueOnce(
      new ShowtimeBuilder().build()
    );
    mockedUserDao.countById.mockResolvedValueOnce(0);

    await expect(
      reservationService.create(reservationCreateInput)
    ).rejects.toThrow("User not found");

    expect(mockedUserDao.countById).toHaveBeenCalledTimes(1);
    expect(mockedUserDao.countById).toHaveBeenCalledWith(
      reservationCreateInput.userId
    );

    expect(mockedReservationDao.create).not.toHaveBeenCalled();
  });

  test("should throw an error if creating a reservation with seatIds that are not in the showtime", async () => {
    mockedShowtimeDao.findById.mockResolvedValueOnce(
      new ShowtimeBuilder().build()
    );
    mockedUserDao.countById.mockResolvedValueOnce(1);
    mockedSeatDao.scanForSeatsInRoom.mockResolvedValueOnce([]);

    await expect(
      reservationService.create(reservationCreateInput)
    ).rejects.toThrow("Seat(s) not found in showtime room");
  });

  test("should throw an error if creating a reservation for a seat that is already reserved", async () => {
    mockedShowtimeDao.findById.mockResolvedValueOnce(
      new ShowtimeBuilder().build()
    );
    mockedUserDao.countById.mockResolvedValueOnce(1);

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

    mockedSeatDao.scanForSeatsInRoom.mockResolvedValueOnce([
      resevedSeatOne,
      reservedSeatTwo,
    ]);
    mockedSeatDao.scanForReservedSeatsByShowtimeId.mockResolvedValueOnce(
      reservedSeatsIds
    );

    await expect(
      reservationService.create(reservationCreateInputAlreadyReservedSeats)
    ).rejects.toThrow("Seat(s) already reserved");
  });
});

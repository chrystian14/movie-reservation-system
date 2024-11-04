import { ReservationDao, type IReservationDao } from "modules/reservations/dao";
import {
  ReservationService,
  type IReservationService,
} from "modules/reservations/service";
import { ShowtimeDao, type IShowtimeDao } from "modules/showtimes/dao";
import { SeatDao, type ISeatDao } from "modules/seats/dao";
import { UserDao, type IUserDao } from "modules/users/dao";
import { randomUUID } from "crypto";

jest.mock("modules/reservations/dao/reservation.dao.ts");
jest.mock("modules/showtimes/dao/showtime.dao.ts");
jest.mock("modules/seats/dao/seat.dao.ts");
jest.mock("modules/users/dao/user.dao.ts");

describe("UNIT: ReservationService.listByUserId", () => {
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

  test("should throw an error if listing a reservation with non-existing user id", async () => {
    mockedUserDao.countById.mockResolvedValueOnce(0);

    const mockedUserId = randomUUID();

    await expect(reservationService.listByUserId(mockedUserId)).rejects.toThrow(
      "User not found"
    );

    expect(mockedUserDao.countById).toHaveBeenCalledTimes(1);
    expect(mockedUserDao.countById).toHaveBeenCalledWith(mockedUserId);

    expect(mockedReservationDao.listByUserId).not.toHaveBeenCalled();
  });
});

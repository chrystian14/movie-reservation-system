import { Router } from "express";
import { ReservationController } from "./controller";
import { ReservationService } from "./service";
import { ReservationDao } from "./dao";
import { isAuthenticated } from "modules/auth/middlewares";
import { validateBody } from "modules/_shared/middlewares";
import { reservationCreateWithoutUserSchema } from "./types/schemas";
import { ShowtimeDao } from "modules/showtimes/dao";
import { SeatDao } from "modules/seats/dao";
import { UserDao } from "modules/users/dao";

export const reservationRouter = Router();

const showtimeDao = new ShowtimeDao();
const seatDao = new SeatDao();
const userDao = new UserDao();
const reservationDao = new ReservationDao();

const reservationService = new ReservationService(
  reservationDao,
  showtimeDao,
  seatDao,
  userDao
);
const reservationController = new ReservationController(reservationService);

reservationRouter.post(
  "",
  isAuthenticated,
  validateBody(reservationCreateWithoutUserSchema),
  reservationController.create
);

reservationRouter.get("", isAuthenticated, reservationController.list);
reservationRouter.delete("/:id", isAuthenticated, reservationController.cancel);

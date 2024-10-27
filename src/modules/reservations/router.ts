import { Router } from "express";
import { ReservationController } from "./controller";
import { ReservationService } from "./service";
import { ReservationRepository } from "./repository";
import { isAuthenticated } from "modules/auth/middlewares";
import { validateBody } from "modules/_shared/middlewares";
import { reservationCreateWithoutUserSchema } from "./types/schemas";
import { ShowtimeRepository } from "modules/showtimes/repository";
import { SeatRepository } from "modules/seats/repository";
import { UserRepository } from "modules/users/repository";

export const reservationRouter = Router();

const showtimeRepository = new ShowtimeRepository();
const seatRepository = new SeatRepository();
const userRepository = new UserRepository();
const reservationRepository = new ReservationRepository();

const reservationService = new ReservationService(
  reservationRepository,
  showtimeRepository,
  seatRepository,
  userRepository
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

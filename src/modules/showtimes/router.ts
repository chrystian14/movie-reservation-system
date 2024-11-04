import { Router } from "express";
import { ShowtimeController } from "./controller";
import { ShowtimeService } from "./service";
import { ShowtimeDao } from "./dao";
import { isAdmin, isAuthenticated } from "modules/auth/middlewares";
import { validateBody, validateQueryParams } from "modules/_shared/middlewares";
import {
  showtimeCreateInputSchema,
  showtimeDateQueryParamSchema,
} from "./types/schemas";
import { RoomDao } from "modules/rooms/dao";
import { MovieDao } from "modules/movies/dao";
import { SeatDao } from "modules/seats/dao";

export const showtimeRouter = Router();

const seatDao = new SeatDao();
const roomDao = new RoomDao();
const movieDao = new MovieDao();
const showtimeDao = new ShowtimeDao();

const showtimeService = new ShowtimeService(
  showtimeDao,
  roomDao,
  movieDao,
  seatDao
);
const showtimeController = new ShowtimeController(showtimeService);

showtimeRouter.post(
  "",
  isAuthenticated,
  isAdmin,
  validateBody(showtimeCreateInputSchema),
  showtimeController.create
);

showtimeRouter.get(
  "",
  isAuthenticated,
  validateQueryParams(showtimeDateQueryParamSchema),
  showtimeController.list
);

showtimeRouter.get(
  "/:id/available-seats",
  isAuthenticated,
  showtimeController.getAvailableSeats
);

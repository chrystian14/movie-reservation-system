import { Router } from "express";
import { ShowtimeController } from "./controller";
import { ShowtimeService } from "./service";
import { ShowtimeRepository } from "./repository";
import { isAdmin, isAuthenticated } from "modules/auth/middlewares";
import { validateBody } from "modules/_shared/middlewares";
import { showtimeCreateInputSchema } from "./types/schemas";
import { RoomRepository } from "modules/rooms/repository";
import { MovieRepository } from "modules/movies/repository";

export const showtimeRouter = Router();

const roomRepository = new RoomRepository();
const movieRepository = new MovieRepository();
const showtimeRepository = new ShowtimeRepository();

const showtimeService = new ShowtimeService(
  showtimeRepository,
  roomRepository,
  movieRepository
);
const showtimeController = new ShowtimeController(showtimeService);

showtimeRouter.post(
  "",
  isAuthenticated,
  isAdmin,
  validateBody(showtimeCreateInputSchema),
  showtimeController.create
);

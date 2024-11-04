import { Router } from "express";
import { MovieController } from "./controller";
import { MovieService } from "./service";
import { MovieDao } from "./dao";
import { GenreDao } from "modules/genres/dao";
import { isAdmin, isAuthenticated } from "modules/auth/middlewares";
import { validateBody } from "modules/_shared/middlewares";
import {
  movieCreateInputSchema,
  movieUpdateInputSchema,
} from "./types/schemas";

export const movieRouter = Router();

const movieDao = new MovieDao();
const genreDao = new GenreDao();
const movieService = new MovieService(movieDao, genreDao);
const movieController = new MovieController(movieService);

movieRouter.post(
  "",
  isAuthenticated,
  isAdmin,
  validateBody(movieCreateInputSchema),
  movieController.create
);

movieRouter.delete("/:id", isAuthenticated, isAdmin, movieController.delete);
movieRouter.patch(
  "/:id",
  validateBody(movieUpdateInputSchema),
  isAuthenticated,
  isAdmin,
  movieController.update
);

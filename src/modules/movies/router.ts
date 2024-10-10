import { Router } from "express";
import { MovieController } from "./controller";
import { MovieService } from "./service";
import { MovieRepository } from "./repository";
import { GenreRepository } from "modules/genres/repository";
import { isAdmin, isAuthenticated } from "modules/auth/middlewares";
import { validateBody } from "modules/_shared/middlewares";
import { movieCreateInputSchema } from "./types/schemas";

export const movieRouter = Router();

const movieRepository = new MovieRepository();
const genreRepository = new GenreRepository();
const movieService = new MovieService(movieRepository, genreRepository);
const movieController = new MovieController(movieService);

movieRouter.post(
  "",
  isAuthenticated,
  isAdmin,
  validateBody(movieCreateInputSchema),
  movieController.create
);

movieRouter.delete("/:id", isAuthenticated, isAdmin, movieController.delete);

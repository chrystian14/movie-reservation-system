import { Router } from "express";
import { GenreController } from "./controller";
import { GenreService } from "./service";
import { GenreDao } from "./dao";
import { isAdmin, isAuthenticated } from "modules/auth/middlewares";
import { validateBody } from "modules/_shared/middlewares";
import { genreCreateInputSchema } from "./types/schemas";

export const genreRouter = Router();

const genreDao = new GenreDao();
const genreService = new GenreService(genreDao);
const genreController = new GenreController(genreService);

genreRouter.post(
  "",
  isAuthenticated,
  isAdmin,
  validateBody(genreCreateInputSchema),
  genreController.create
);

genreRouter.delete("/:id", isAuthenticated, isAdmin, genreController.delete);

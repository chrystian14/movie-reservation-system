import { Router } from "express";
import { GenreController } from "./controller";
import { GenreService } from "./service";
import { GenreRepository } from "./repository";
import { isAdmin, isAuthenticated } from "modules/auth/middlewares";

export const genreRouter = Router();

const genreRepository = new GenreRepository();
const genreService = new GenreService(genreRepository);
const genreController = new GenreController(genreService);

genreRouter.post("", isAuthenticated, isAdmin, genreController.create);

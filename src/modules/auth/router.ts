import { Router } from "express";
import { AuthController } from "./controller";
import { AuthService } from "./service";
import { UserDao } from "modules/users/dao";
import { validateBody } from "modules/_shared/middlewares";
import { loginInputSchema } from "./types/schemas";

export const authRouter = Router();

const userDao = new UserDao();
const authService = new AuthService(userDao);
const authController = new AuthController(authService);

authRouter.post("", validateBody(loginInputSchema), authController.login);

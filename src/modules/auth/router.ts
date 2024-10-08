import { Router } from "express";
import { AuthController } from "./controller";
import { AuthService } from "./service";
import { UserRepository } from "modules/users/repository";
import { validateBody } from "modules/_shared/middlewares";
import { loginInputSchema } from "./types/schemas";

export const authRouter = Router();

const userRepository = new UserRepository();
const authService = new AuthService(userRepository);
const authController = new AuthController(authService);

authRouter.post("", validateBody(loginInputSchema), authController.login);

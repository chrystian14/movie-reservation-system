import { Router } from "express";
import { AuthController } from "./controller";
import { AuthService } from "./service";
import { UserRepository } from "modules/users/repository";

export const authRouter = Router();

const userRepository = new UserRepository();
const authService = new AuthService(userRepository);
const authController = new AuthController(authService);

authRouter.post("", authController.login);

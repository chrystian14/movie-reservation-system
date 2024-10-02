import { Router } from "express";
import { UserService } from "./service";
import { UserRepository } from "./repository";
import { UserController } from "./controller/user.controller";

export const userRouter = Router();

const userRepository = new UserRepository();
const userService = new UserService(userRepository);
const userController = new UserController(userService);

userRouter.post("", userController.create);

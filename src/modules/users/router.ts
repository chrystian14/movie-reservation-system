import { Router } from "express";
import { UserService } from "./service";
import { UserDao } from "./dao";
import { UserController } from "./controller/user.controller";
import { validateBody } from "modules/_shared/middlewares";
import { userCreateInputSchema } from "./types/schemas";

export const userRouter = Router();

const userDao = new UserDao();
const userService = new UserService(userDao);
const userController = new UserController(userService);

userRouter.post("", validateBody(userCreateInputSchema), userController.create);

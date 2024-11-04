import { Router } from "express";
import { RoomController } from "./controller";
import { RoomService } from "./service";
import { RoomDao } from "./dao";
import { isAdmin, isAuthenticated } from "modules/auth/middlewares";
import { validateBody } from "modules/_shared/middlewares";
import { roomCreateInputSchema } from "./types/schemas";

export const roomRouter = Router();

const roomDao = new RoomDao();
const roomService = new RoomService(roomDao);
const roomController = new RoomController(roomService);

roomRouter.post(
  "",
  isAuthenticated,
  isAdmin,
  validateBody(roomCreateInputSchema),
  roomController.create
);

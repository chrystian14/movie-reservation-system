import { Router } from "express";
import { RoomController } from "./controller";
import { RoomService } from "./service";
import { RoomRepository } from "./repository";
import { isAdmin, isAuthenticated } from "modules/auth/middlewares";
import { validateBody } from "modules/_shared/middlewares";
import { roomCreateInputSchema } from "./types/schemas";

export const roomRouter = Router();

const roomRepository = new RoomRepository();
const roomService = new RoomService(roomRepository);
const roomController = new RoomController(roomService);

roomRouter.post(
  "",
  isAuthenticated,
  isAdmin,
  validateBody(roomCreateInputSchema),
  roomController.create
);

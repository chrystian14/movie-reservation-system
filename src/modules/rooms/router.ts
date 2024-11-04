import { Router } from "express";
import { RoomController } from "./controller";
import { RoomService } from "./service";
import { RoomDao } from "./dao";
import { isAdmin, isAuthenticated } from "modules/auth/middlewares";
import { validateBody } from "modules/_shared/middlewares";
import { roomCreateInputSchema } from "./types/schemas";
import { SeatDao } from "modules/seats/dao";
import { SeatController } from "modules/seats/controller";
import { seatCreateWithoutRoomIdSchema } from "modules/seats/types/schemas";
import { SeatService } from "modules/seats/service";

export const roomRouter = Router();

const roomDao = new RoomDao();
const roomService = new RoomService(roomDao);
const roomController = new RoomController(roomService);

const seatDao = new SeatDao();
const seatService = new SeatService(seatDao, roomDao);
const seatController = new SeatController(seatService);

roomRouter.post(
  "",
  isAuthenticated,
  isAdmin,
  validateBody(roomCreateInputSchema),
  roomController.create
);

roomRouter.post(
  "/:roomId/seats",
  isAuthenticated,
  isAdmin,
  validateBody(seatCreateWithoutRoomIdSchema),
  seatController.create
);

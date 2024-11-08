import { status } from "modules/_shared/utils";
import type { IRoomService } from "../service";
import type { Request } from "express";
import type { AuthenticatedResponse } from "modules/auth/types";

export class RoomController {
  constructor(private readonly roomService: IRoomService) {}

  create = async (req: Request, res: AuthenticatedResponse) => {
    const room = await this.roomService.create(req.body);

    return res.status(status.HTTP_201_CREATED).json(room);
  };
}

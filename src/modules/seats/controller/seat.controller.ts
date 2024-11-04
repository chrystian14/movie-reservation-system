import { status } from "modules/_shared/utils";
import type { ISeatService } from "../service";
import type { Request } from "express";
import type { AutheticatedResponse } from "modules/auth/types";
import type { SeatCreateInput } from "../types";

export class SeatController {
  constructor(private readonly seatService: ISeatService) {}

  create = async (req: Request, res: AutheticatedResponse) => {
    const seatCreateInput: SeatCreateInput = {
      ...req.body,
      roomId: req.params.roomId,
    };

    const seat = await this.seatService.create(seatCreateInput);

    return res.status(status.HTTP_201_CREATED).json(seat);
  };
}

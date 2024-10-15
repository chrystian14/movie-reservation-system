import { status } from "modules/_shared/utils";
import type { IShowtimeService } from "../service";
import type { Request } from "express";
import type { AutheticatedResponse } from "modules/auth/types";

export class ShowtimeController {
  constructor(private readonly showtimeService: IShowtimeService) {}

  create = async (req: Request, res: AutheticatedResponse) => {
    const showtime = await this.showtimeService.create(req.body);

    return res.status(status.HTTP_201_CREATED).json(showtime);
  };
}

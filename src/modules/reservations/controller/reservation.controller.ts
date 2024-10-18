import { status } from "modules/_shared/utils";
import type { IReservationService } from "../service";
import type { Request } from "express";
import type { AutheticatedResponse } from "modules/auth/types";

export class ReservationController {
  constructor(private readonly reservationService: IReservationService) {}

  create = async (req: Request, res: AutheticatedResponse) => {
    const reservation = await this.reservationService.create(req.body);

    return res.status(status.HTTP_201_CREATED).json(reservation);
  };
}

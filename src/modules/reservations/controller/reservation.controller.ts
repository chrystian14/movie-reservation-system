import { status } from "modules/_shared/utils";
import type { IReservationService } from "../service";
import type { Request } from "express";
import type { AutheticatedResponse } from "modules/auth/types";
import type { ReservationCreateInput } from "../types";

export class ReservationController {
  constructor(private readonly reservationService: IReservationService) {}

  create = async (req: Request, res: AutheticatedResponse) => {
    const { sub } = res.locals.authenticatedUser;

    const reservationCreateInput: ReservationCreateInput = {
      ...req.body,
      userId: sub,
    };

    const reservation = await this.reservationService.create(
      reservationCreateInput
    );

    return res.status(status.HTTP_201_CREATED).json(reservation);
  };
}

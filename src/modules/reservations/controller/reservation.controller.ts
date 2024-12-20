import { status } from "modules/_shared/utils";
import type { IReservationService } from "../service";
import type { Request } from "express";
import type { AuthenticatedResponse } from "modules/auth/types";
import type { ReservationCreateInput } from "../types";

export class ReservationController {
  constructor(private readonly reservationService: IReservationService) {}

  list = async (req: Request, res: AuthenticatedResponse) => {
    const { sub, isAdmin } = res.locals.authenticatedUser;

    if (isAdmin) {
      return res
        .status(status.HTTP_200_OK)
        .json(await this.reservationService.list());
    }

    return res
      .status(status.HTTP_200_OK)
      .json(await this.reservationService.listByUserId(sub));
  };

  create = async (req: Request, res: AuthenticatedResponse) => {
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

  cancel = async (req: Request, res: AuthenticatedResponse) => {
    const { sub } = res.locals.authenticatedUser;

    const reservationId = req.params.id;

    await this.reservationService.cancel(reservationId, sub);

    return res.status(status.HTTP_204_NO_CONTENT).json();
  };
}

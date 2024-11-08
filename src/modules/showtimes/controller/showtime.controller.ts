import { status } from "modules/_shared/utils";
import type { IShowtimeService } from "../service";
import type { Request, Response } from "express";
import type { AuthenticatedResponse } from "modules/auth/types";
import type { Showtime, ShowtimeDateQueryParam } from "../types";
import { getPaginatedResponse } from "modules/_shared/pagination/paginated-response";

export class ShowtimeController {
  constructor(private readonly showtimeService: IShowtimeService) {}

  create = async (req: Request, res: AuthenticatedResponse) => {
    const showtime = await this.showtimeService.create(req.body);

    return res.status(status.HTTP_201_CREATED).json(showtime);
  };

  list = async (
    req: Request<ShowtimeDateQueryParam>,
    res: Response
  ): Promise<void> => {
    const dateQueryParam = req.query.date ? String(req.query.date) : undefined;
    const { page, perPage } = res.locals;

    const showtimes = await this.showtimeService.list(dateQueryParam);

    const paginatedResponse = getPaginatedResponse<Showtime>(
      showtimes.length,
      page,
      perPage,
      showtimes,
      req
    );

    res.status(status.HTTP_200_OK).json(paginatedResponse);
  };

  getAvailableSeats = async (req: Request, res: AuthenticatedResponse) => {
    const availableSeats = await this.showtimeService.getAvailableSeats(
      req.params.id
    );

    return res.status(status.HTTP_200_OK).json(availableSeats);
  };
}

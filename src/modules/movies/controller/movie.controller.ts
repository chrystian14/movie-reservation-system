import { status } from "modules/_shared/utils";
import type { IMovieService } from "../service";
import type { Request } from "express";
import type { AutheticatedResponse } from "modules/auth/types";

export class MovieController {
  constructor(private readonly movieService: IMovieService) {}

  create = async (req: Request, res: AutheticatedResponse) => {
    const movie = await this.movieService.create(req.body);

    return res.status(status.HTTP_201_CREATED).json(movie);
  };
}

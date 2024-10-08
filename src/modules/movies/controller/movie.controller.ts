import { status } from "modules/_shared/utils";
import type { IMovieService } from "../service";
import type { Request, Response } from "express";

export class MovieController {
  constructor(private readonly movieService: IMovieService) {}

  create = async (req: Request, res: Response) => {
    const movie = await this.movieService.create(req.body);

    return res.status(status.HTTP_201_CREATED).json(movie);
  };
}

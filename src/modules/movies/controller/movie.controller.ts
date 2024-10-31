import { status } from "modules/_shared/utils";
import type { IMovieService } from "../service";
import type { Request } from "express";
import type { AutheticatedResponse } from "modules/auth/types";
import { Logger } from "configs/loggers";

export class MovieController {
  constructor(private readonly movieService: IMovieService) {}

  create = async (req: Request, res: AutheticatedResponse) => {
    const movie = await this.movieService.create(req.body);

    const { authenticatedUser } = res.locals;

    Logger.info(
      `Movie created with id: ${movie.id} by user id ${authenticatedUser.sub}`
    );
    return res.status(status.HTTP_201_CREATED).json(movie);
  };

  delete = async (req: Request, res: AutheticatedResponse) => {
    await this.movieService.delete(req.params.id);

    const { authenticatedUser } = res.locals;

    Logger.info(
      `Movie deleted with id: ${req.params.id} by user id ${authenticatedUser.sub}`
    );

    return res.status(status.HTTP_204_NO_CONTENT).end();
  };

  update = async (req: Request, res: AutheticatedResponse) => {
    const updatedMovie = await this.movieService.update(
      req.params.id,
      req.body
    );

    const { authenticatedUser } = res.locals;

    Logger.info(
      `Movie updated with id: ${req.params.id} by user id ${
        authenticatedUser.sub
      }: ${JSON.stringify(updatedMovie)}`
    );

    return res.status(status.HTTP_200_OK).json(updatedMovie);
  };
}

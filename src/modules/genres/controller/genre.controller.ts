import { status } from "modules/_shared/utils";
import type { IGenreService } from "../service";
import type { Request } from "express";
import type { AuthenticatedResponse } from "modules/auth/types";

export class GenreController {
  constructor(private readonly genreService: IGenreService) {}

  create = async (req: Request, res: AuthenticatedResponse) => {
    const genre = await this.genreService.create(req.body);

    return res.status(status.HTTP_201_CREATED).json(genre);
  };

  delete = async (req: Request, res: AuthenticatedResponse) => {
    await this.genreService.delete(req.params.id);
    return res.status(status.HTTP_204_NO_CONTENT).end();
  };
}

import { GenreNameAlreadyExistsError, GenreNotFoundError } from "../errors";
import type { IGenreDao } from "../dao";
import type { Genre, GenreCreateInput } from "../types";
import type { IGenreService } from "./genre.service.interface";

export class GenreService implements IGenreService {
  constructor(private readonly genreDao: IGenreDao) {}

  async delete(id: string): Promise<void> {
    const genreCount = await this.genreDao.countById(id);

    if (!genreCount) {
      throw new GenreNotFoundError();
    }

    await this.genreDao.delete(id);
  }

  async create(genreCreateInput: GenreCreateInput): Promise<Genre> {
    const genreNameCount = await this.genreDao.countByName(
      genreCreateInput.name
    );

    if (genreNameCount > 0) {
      throw new GenreNameAlreadyExistsError();
    }

    return await this.genreDao.create(genreCreateInput);
  }
}

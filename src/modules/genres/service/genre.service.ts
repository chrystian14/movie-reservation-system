import { GenreNameAlreadyExistsError } from "../errors";
import type { IGenreRepository } from "../repository";
import type { Genre, GenreCreateInput } from "../types";
import type { IGenreService } from "./genre.service.interface";

export class GenreService implements IGenreService {
  constructor(private readonly genreRepository: IGenreRepository) {}

  async create(genreCreateInput: GenreCreateInput): Promise<Genre> {
    const genreNameCount = await this.genreRepository.countByName(
      genreCreateInput.name
    );

    if (genreNameCount > 0) {
      throw new GenreNameAlreadyExistsError();
    }

    return await this.genreRepository.create(genreCreateInput);
  }
}

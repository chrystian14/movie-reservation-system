import type { GenreCreateInput, Genre } from "../types";

export interface IGenreService {
  create(genreCreateInput: GenreCreateInput): Promise<Genre>;
  delete(id: string): Promise<void>;
}

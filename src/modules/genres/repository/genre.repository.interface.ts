import type { Genre, GenreCreateInput } from "../types";

export interface IGenreRepository {
  countByName(name: string): Promise<number>;
  countById(id: string): Promise<number>;
  create(genreCreateInput: GenreCreateInput): Promise<Genre>;
  delete(id: string): Promise<void>;
}

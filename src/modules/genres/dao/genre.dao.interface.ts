import type { Genre, GenreCreateInput } from "../types";

export interface IGenreDao {
  countByName(name: string): Promise<number>;
  countById(id: string): Promise<number>;
  create(genreCreateInput: GenreCreateInput): Promise<Genre>;
  delete(id: string): Promise<void>;
}

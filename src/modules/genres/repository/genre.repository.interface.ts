import type { Genre, GenreCreateInput } from "../types";

export interface IGenreRepository {
  create(genreCreateInput: GenreCreateInput): Promise<Genre>;
  countByName(name: string): Promise<number>;
  countById(id: string): Promise<number>;
}

import type { Movie, MovieCreateInput, MovieUpdateInput } from "../types";

export interface IMovieRepository {
  create(movieCreateInput: MovieCreateInput): Promise<Movie>;
  countById(id: string): Promise<number>;
  delete(id: string): Promise<void>;
  update(id: string, movieUpdateInput: MovieUpdateInput): Promise<Movie>;
}

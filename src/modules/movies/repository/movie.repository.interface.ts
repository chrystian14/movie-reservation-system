import type { Movie, MovieCreateInput } from "../types";

export interface IMovieRepository {
  create(movieCreateInput: MovieCreateInput): Promise<Movie>;
  countById(id: string): Promise<number>;
  delete(id: string): Promise<void>;
}

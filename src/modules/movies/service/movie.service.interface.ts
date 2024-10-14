import type { MovieCreateInput, Movie, MovieUpdateInput } from "../types";

export interface IMovieService {
  create(movieCreateInput: MovieCreateInput): Promise<Movie>;
  delete(id: string): Promise<void>;
  update(id: string, movieUpdateInput: MovieUpdateInput): Promise<Movie>;
}

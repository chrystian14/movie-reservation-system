import type { MovieCreateInput, Movie } from "../types";

export interface IMovieService {
  create(movieCreateInput: MovieCreateInput): Promise<Movie>;
}

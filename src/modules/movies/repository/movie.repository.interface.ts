import type { Movie, MovieCreateInput } from "../types";

export interface IMovieRepository {
  create(movieCreateInput: MovieCreateInput): Promise<Movie>;
}

import type { Movie, MovieCreateInput } from "../types";
import type { IMovieRepository } from "./movie.repository.interface";
import { prisma } from "configs/prisma-client.config";

export class MovieRepository implements IMovieRepository {
  async create(movieCreateInput: MovieCreateInput): Promise<Movie> {
    return await prisma.movie.create({
      data: movieCreateInput,
    });
  }
}

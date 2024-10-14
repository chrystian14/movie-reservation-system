import type { Movie, MovieCreateInput, MovieUpdateInput } from "../types";
import type { IMovieRepository } from "./movie.repository.interface";
import { prisma } from "configs/prisma-client.config";

export class MovieRepository implements IMovieRepository {
  async create(movieCreateInput: MovieCreateInput): Promise<Movie> {
    return await prisma.movie.create({
      data: movieCreateInput,
    });
  }

  async countById(id: string): Promise<number> {
    return await prisma.movie.count({
      where: { id },
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.movie.delete({
      where: { id },
    });
  }

  async update(id: string, movieUpdateInput: MovieUpdateInput): Promise<Movie> {
    return await prisma.movie.update({
      where: { id },
      data: movieUpdateInput,
    });
  }
}

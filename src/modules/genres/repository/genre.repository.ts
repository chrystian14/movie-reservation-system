import type { Genre, GenreCreateInput } from "../types";
import type { IGenreRepository } from "./genre.repository.interface";
import { prisma } from "configs/prisma-client.config";

export class GenreRepository implements IGenreRepository {
  async create(genreCreateInput: GenreCreateInput): Promise<Genre> {
    return await prisma.genre.create({
      data: genreCreateInput,
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.genre.delete({
      where: {
        id,
      },
    });
  }

  async countByName(name: string): Promise<number> {
    return await prisma.genre.count({
      where: {
        name,
      },
    });
  }

  async countById(id: string): Promise<number> {
    return await prisma.genre.count({
      where: {
        id,
      },
    });
  }
}

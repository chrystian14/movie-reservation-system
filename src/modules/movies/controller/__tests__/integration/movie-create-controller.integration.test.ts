import { clearDatabase } from "configs/jest-setup.config";
import { prisma } from "configs/prisma-client.config";
import { apiClient } from "modules/_shared/tests";
import { status } from "modules/_shared/utils";
import { GenreBuilder } from "modules/genres/builder";
import {
  GenreRepository,
  type IGenreRepository,
} from "modules/genres/repository";
import type { Genre } from "modules/genres/types";
import { MovieBuilder } from "modules/movies/builder";
import { type Movie, type MovieCreateInput } from "modules/movies/types";

describe("INTEGRATION: MovieControler.create - POST /api/v1/movies", () => {
  const movieEndpoint = "/api/v1/movies";

  let movieBuilder: MovieBuilder;
  let movieWithValidGenre: MovieCreateInput;

  let genreBuilder: GenreBuilder;
  let genreRepository: IGenreRepository;
  let createdGenre: Genre;

  beforeEach(async () => {
    await clearDatabase();

    genreBuilder = new GenreBuilder();
    genreRepository = new GenreRepository();
    createdGenre = await genreBuilder.save(genreRepository);

    movieBuilder = new MovieBuilder();

    movieWithValidGenre = movieBuilder
      .withGenreId(createdGenre.id)
      .requiredForCreation();
  });

  test("should create a movie", async () => {
    const response = await apiClient
      .post(movieEndpoint)
      .send(movieWithValidGenre);

    expect(response.status).toBe(status.HTTP_201_CREATED);

    const expectedResponseBody: Movie = {
      id: expect.any(String),
      title: movieWithValidGenre.title,
      description: movieWithValidGenre.description,
      posterUrl: movieWithValidGenre.posterUrl,
      genreId: movieWithValidGenre.genreId,
    };

    expect(response.body).toStrictEqual(expectedResponseBody);

    const movieCount = await prisma.movie.count();
    expect(movieCount).toBe(1);
  });
});

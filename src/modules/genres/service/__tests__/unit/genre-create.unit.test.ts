import {
  GenreRepository,
  type IGenreRepository,
} from "modules/genres/repository";
import type { GenreCreateInput } from "modules/genres/types";
import { GenreService, type IGenreService } from "modules/genres/service";
import { GenreBuilder } from "modules/genres/builder";

jest.mock("modules/genres/repository/genre.repository.ts");

describe("UNIT: GenreService.create", () => {
  let mockedGenreRepository: jest.Mocked<IGenreRepository>;
  let genreCreateInput: GenreCreateInput;

  let genreService: IGenreService;

  beforeEach(() => {
    mockedGenreRepository = jest.mocked(new GenreRepository());
    genreService = new GenreService(mockedGenreRepository);

    genreCreateInput = new GenreBuilder().requiredForCreation();
  });

  test("should throw an error if creating a genre with duplicated name", async () => {
    mockedGenreRepository.countByName.mockResolvedValue(1);

    await expect(genreService.create(genreCreateInput)).rejects.toThrow(
      "Genre name already exists"
    );
  });
});

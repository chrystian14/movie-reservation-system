import { GenreDao, type IGenreDao } from "modules/genres/dao";
import type { GenreCreateInput } from "modules/genres/types";
import { GenreService, type IGenreService } from "modules/genres/service";
import { GenreBuilder } from "modules/genres/builder";

jest.mock("modules/genres/dao/genre.dao.ts");

describe("UNIT: GenreService.create", () => {
  let mockedGenreDao: jest.Mocked<IGenreDao>;
  let genreCreateInput: GenreCreateInput;

  let genreService: IGenreService;

  beforeEach(() => {
    mockedGenreDao = jest.mocked(new GenreDao());
    genreService = new GenreService(mockedGenreDao);

    genreCreateInput = new GenreBuilder().requiredForCreation();
  });

  test("should throw an error if creating a genre with duplicated name", async () => {
    mockedGenreDao.countByName.mockResolvedValueOnce(1);

    await expect(genreService.create(genreCreateInput)).rejects.toThrow(
      "Genre name already exists"
    );
  });
});

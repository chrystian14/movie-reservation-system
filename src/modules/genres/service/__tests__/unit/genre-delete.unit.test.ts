import { GenreService, type IGenreService } from "modules/genres/service";
import { GenreDao, type IGenreDao } from "modules/genres/dao";
import { randomUUID } from "crypto";

jest.mock("modules/genres/dao/genre.dao.ts");

describe("UNIT: GenreService.delete", () => {
  let genreService: IGenreService;

  let mockedGenreDao: jest.Mocked<IGenreDao>;

  beforeEach(() => {
    mockedGenreDao = jest.mocked(new GenreDao());
    genreService = new GenreService(mockedGenreDao);
  });

  test("should throw an error if deleting a genre with non-existing id", async () => {
    mockedGenreDao.countById.mockResolvedValueOnce(0);

    const mockedGenreId = randomUUID();
    await expect(genreService.delete(mockedGenreId)).rejects.toThrow(
      "Genre not found"
    );

    expect(mockedGenreDao.countById).toHaveBeenCalledTimes(1);
    expect(mockedGenreDao.countById).toHaveBeenCalledWith(mockedGenreId);

    expect(mockedGenreDao.delete).not.toHaveBeenCalled();
  });
});

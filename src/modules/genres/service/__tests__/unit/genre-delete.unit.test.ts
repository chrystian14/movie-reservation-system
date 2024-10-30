import { GenreService, type IGenreService } from "modules/genres/service";
import {
  GenreRepository,
  type IGenreRepository,
} from "modules/genres/repository";
import { randomUUID } from "crypto";

jest.mock("modules/genres/repository/genre.repository.ts");

describe("UNIT: GenreService.delete", () => {
  let genreService: IGenreService;

  let mockedGenreRepository: jest.Mocked<IGenreRepository>;

  beforeEach(() => {
    mockedGenreRepository = jest.mocked(new GenreRepository());
    genreService = new GenreService(mockedGenreRepository);
  });

  test("should throw an error if deleting a genre with non-existing id", async () => {
    mockedGenreRepository.countById.mockResolvedValueOnce(0);

    const mockedGenreId = randomUUID();
    await expect(genreService.delete(mockedGenreId)).rejects.toThrow(
      "Genre not found"
    );

    expect(mockedGenreRepository.countById).toHaveBeenCalledTimes(1);
    expect(mockedGenreRepository.countById).toHaveBeenCalledWith(mockedGenreId);

    expect(mockedGenreRepository.delete).not.toHaveBeenCalled();
  });
});

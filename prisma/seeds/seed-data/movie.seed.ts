import { randomUUID } from "crypto";
import type { Movie } from "modules/movies/types";
import type { GenreName } from "./genre.seed";

export type MovieSeed = Omit<Movie, "genreId"> & { genreName: GenreName };

export const movieSeeds: MovieSeed[] = [
  {
    id: randomUUID(),
    title: "A Origem",
    description:
      "Um ladrão que rouba segredos corporativos usando a tecnologia de compartilhamento de sonhos.",
    posterUrl: "https://linktoposter.com/aorigem.jpg",
    genreName: "action",
  },
  {
    id: randomUUID(),
    title: "O Cavaleiro das Trevas",
    description:
      "Batman enfrenta o Coringa, um mestre do crime que quer mergulhar Gotham City na anarquia.",
    posterUrl: "https://linktoposter.com/ocavaleirodasTrevas.jpg",
    genreName: "action",
  },
  {
    id: randomUUID(),
    title: "Interestelar",
    description:
      "Uma equipe de exploradores viaja através de um buraco de minhoca no espaço em uma tentativa de garantir a sobrevivência da humanidade.",
    posterUrl: "https://linktoposter.com/interestelar.jpg",
    genreName: "sci-fi",
  },
  {
    id: randomUUID(),
    title: "Matrix",
    description:
      "Um hacker descobre a verdade sobre sua realidade e seu papel na guerra contra seus controladores.",
    posterUrl: "https://linktoposter.com/matrix.jpg",
    genreName: "sci-fi",
  },
  {
    id: randomUUID(),
    title: "O Senhor dos Anéis: A Sociedade do Anel",
    description:
      "Um hobbit recebe a tarefa de destruir um anel poderoso para salvar a Terra Média.",
    posterUrl: "https://linktoposter.com/osenhordosaneis.jpg",
    genreName: "fantasy",
  },
  {
    id: randomUUID(),
    title: "Forrest Gump: O Contador de Histórias",
    description:
      "Um homem simples narra sua vida extraordinária e como ele se entrelaça com eventos históricos significativos.",
    posterUrl: "https://linktoposter.com/forrestgump.jpg",
    genreName: "comedy",
  },
  {
    id: randomUUID(),
    title: "A Lista de Schindler",
    description:
      "A história real de um empresário que salvou mais de mil judeus durante o Holocausto.",
    posterUrl: "https://linktoposter.com/listadeschindler.jpg",
    genreName: "drama",
  },
  {
    id: randomUUID(),
    title: "Pulp Fiction: Tempo de Violência",
    description: "Histórias entrelaçadas de crime e redenção em Los Angeles.",
    posterUrl: "https://linktoposter.com/pulpfiction.jpg",
    genreName: "crime",
  },
  {
    id: randomUUID(),
    title: "O Poderoso Chefão",
    description:
      "A saga de uma família de mafiosos e sua luta pelo poder nos Estados Unidos.",
    posterUrl: "https://linktoposter.com/chefao.jpg",
    genreName: "crime",
  },
];

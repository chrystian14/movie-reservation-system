import { randomUUID } from "crypto";
import type { Genre } from "modules/genres/types";

export type GenreName = (typeof genreSeeds)[number]["name"];

export const genreSeeds: Genre[] = [
  {
    id: randomUUID(),
    name: "action",
  },
  {
    id: randomUUID(),
    name: "adventure",
  },
  {
    id: randomUUID(),
    name: "comedy",
  },
  {
    id: randomUUID(),
    name: "family",
  },
  {
    id: randomUUID(),
    name: "fantasy",
  },
  {
    id: randomUUID(),
    name: "drama",
  },
  {
    id: randomUUID(),
    name: "sci-fi",
  },
  {
    id: randomUUID(),
    name: "crime",
  },
] as const;

export const genreMap = genreSeeds.reduce((acc, genre) => {
  acc[genre.name] = genre.id;
  return acc;
}, {} as Record<GenreName, string>);

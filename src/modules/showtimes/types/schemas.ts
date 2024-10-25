import z from "zod";

export const showtimeSchema = z.object({
  id: z.string().uuid(),
  datetime: z.date(),
  movieId: z.string().uuid(),
  roomId: z.string().uuid(),
});

export const showtimeCreateInputSchema = showtimeSchema
  .omit({
    id: true,
  })
  .extend({
    datetime: z
      .string()
      .datetime({
        message:
          "Invalid datetime format. Format must be ISO8601: `YYYY-MM-DDTHH:mm:ssZ`",
      })
      .transform((str) => new Date(str)),
  });

export const showtimeDateQueryParamSchema = z.object({
  date: z
    .string()
    .date("Invalid date. Date param must be in the format YYYY-MM-DD")
    .optional(),
});

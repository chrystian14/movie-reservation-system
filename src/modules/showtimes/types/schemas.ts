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
          "Invalid datetime format. Format must be `YYYY-MM-DDTHH:mm:ss`",
      })
      .transform((str) => new Date(str)),
  });

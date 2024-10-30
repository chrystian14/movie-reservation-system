import { Router, type Express } from "express";
import { userRouter } from "./modules/users/router";
import { authRouter } from "modules/auth/router";
import { movieRouter } from "modules/movies/router";
import { roomRouter } from "modules/rooms/router";
import { showtimeRouter } from "modules/showtimes/router";
import { reservationRouter } from "modules/reservations/router";
import { swaggerRouter } from "configs/swagger.config";
import { genreRouter } from "modules/genres/router";

export function initRoutes(app: Express) {
  const v1Router = Router();

  v1Router.use("/docs", swaggerRouter);

  v1Router.use("/v1/users", userRouter);
  v1Router.use("/v1/login", authRouter);
  v1Router.use("/v1/movies", movieRouter);
  v1Router.use("/v1/genres", genreRouter);
  v1Router.use("/v1/rooms", roomRouter);
  v1Router.use("/v1/showtimes", showtimeRouter);
  v1Router.use("/v1/reservations", reservationRouter);

  app.use("/api", v1Router);
}

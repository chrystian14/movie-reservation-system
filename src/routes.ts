import { Router, type Express } from "express";
import { userRouter } from "./modules/users/router";
import { authRouter } from "modules/auth/router";
import { movieRouter } from "modules/movies/router";
import { roomRouter } from "modules/rooms/router";
import { showtimeRouter } from "modules/showtimes/router";

export function initRoutes(app: Express) {
  const v1Router = Router();

  v1Router.use("/v1/users", userRouter);
  v1Router.use("/v1/login", authRouter);
  v1Router.use("/v1/movies", movieRouter);
  v1Router.use("/v1/rooms", roomRouter);
  v1Router.use("/v1/showtimes", showtimeRouter);

  app.use("/api", v1Router);
}

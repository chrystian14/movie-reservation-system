import { Router, type Express } from "express";
import { userRouter } from "./modules/users";

export function initRoutes(app: Express) {
  const v1Router = Router();

  v1Router.use("/v1/users", userRouter);

  app.use("/api", v1Router);
}

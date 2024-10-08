import { Router, type Express } from "express";
import { userRouter } from "./modules/users";
import { authRouter } from "modules/auth";

export function initRoutes(app: Express) {
  const v1Router = Router();

  v1Router.use("/v1/users", userRouter);
  v1Router.use("/v1/login", authRouter);

  app.use("/api", v1Router);
}

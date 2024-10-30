import { customMorganLogger } from "configs/loggers";
import express from "express";
import "express-async-errors";
import { handleGlobalErrors } from "modules/_shared/errors";
import { initRoutes } from "routes";

function createApp() {
  const app = express();
  app.use(express.json());

  if (process.env.NODE_ENV !== "test") {
    app.use(customMorganLogger);
  }

  initRoutes(app);

  app.get("/health-check", (req, res) => {
    return res.json({ status: "healthy" });
  });

  app.use(handleGlobalErrors);

  return app;
}

export const app = createApp();

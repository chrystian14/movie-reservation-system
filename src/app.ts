import express from "express";
import "express-async-errors";
import { handleGlobalErrors } from "modules/_shared/errors";

import morgan from "morgan";
import { initRoutes } from "routes";

export const app = express();

app.use(express.json());
app.use(morgan("dev"));

initRoutes(app);

app.use(handleGlobalErrors);

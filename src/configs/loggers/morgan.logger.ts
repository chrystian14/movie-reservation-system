import morgan from "morgan";
import { Logger } from "./winston.logger";
import type { Request, Response } from "express";
import { parsedEnv } from "configs/env.config";

export const customMorganLogger = morgan("combined", {
  stream: {
    write: (message: string) => {
      Logger.http(message.trim());
    },
  },
  skip: (req: Request, _res: Response) => {
    return req.baseUrl.includes("docs");
  },
});

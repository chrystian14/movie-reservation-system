import { parsedEnv, type NodeEnv } from "configs/env.config";
import winston from "winston";

const AppEnvLevel: Record<NodeEnv, keyof typeof logLevels> = {
  test: "error",
  dev: "debug",
  prod: "http",
};

const logLevels: Record<string, number> = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  verbose: 4,
  debug: 5,
  silly: 6,
};

export const Logger = winston.createLogger({
  level: AppEnvLevel[parsedEnv.NODE_ENV],
  levels: logLevels,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.align(),
    winston.format.printf(({ level, message, timestamp }) => {
      return `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize({ all: true })),
    }),
  ],
});

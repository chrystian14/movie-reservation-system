import { Logger } from "configs/loggers";
import { app } from "./app";
import { parsedEnv } from "configs/env.config";

const PORT = parsedEnv.PORT;

app.listen(PORT, () => {
  Logger.info(`Server listening at http://localhost:${PORT}`);
});

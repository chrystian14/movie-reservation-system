import { app } from "./app";
import { parsedEnv } from "configs/env.config";

const PORT = parsedEnv.PORT;

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});

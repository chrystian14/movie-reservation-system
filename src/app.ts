import express from "express";
import { userRouter } from "modules/users";
import morgan from "morgan";

export const app = express();

app.use(express.json());
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.json({ message: "Hello World!" });
});

app.use("/api/v1/users", userRouter);

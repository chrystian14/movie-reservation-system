import express from "express";
import morgan from "morgan";

export const app = express();

app.use(express.json());
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.json({ message: "Hello World!" });
});

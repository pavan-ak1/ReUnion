import dotenv from "dotenv";
import express from "express";
import type { Request, Response } from "express";
import cors from "cors";

dotenv.config();

const app = express();

//middlewares
app.use(express.json());
app.use(cors());

app.get("/", (req: Request, res: Response) => {
  res.send("API running in backend");
});

const port = process.env.PORT || 5000;

const start = async () => {
  try {
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.log(error);
  }
};

start();

import dotenv from "dotenv";
import express from "express";
import type { Request, Response } from "express";
import cors from "cors";

//To log all the incomming requests to the server
import morgan from 'morgan';


dotenv.config();

const app = express();

//middlewares
app.use(express.json());
app.use(cors());

//basic route
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

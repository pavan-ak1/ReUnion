import dotenv from "dotenv";
dotenv.config();
import express from "express";
import type { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

//To log all the incomming requests to the server
import morgan from 'morgan';



//imports
import { connectDb } from "./db/db.js";
import authRoutes from "./routes/authRoutes.js";
import studentRoutes from "./routes/studentProfileRoutes.js"
import eventRoutes from "./routes/eventRoutes.js"


const app = express();

//middlewares
app.use(express.json());
app.use(cors());
app.use(cookieParser(process.env.JWT_SECRET))



//basic route
app.get("/", (req: Request, res: Response) => {
  res.send("API running in backend");
});


//Using the imports
app.use('/api/v1',authRoutes);
app.use('/api/v1', studentRoutes);
app.use('/api/v1',eventRoutes);

const port = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectDb()
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.log(error);
  }
};

start();

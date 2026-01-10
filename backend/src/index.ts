import "dotenv/config";
import express from "express";
import type { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

//To log all the incomming requests to the server
import morgan from "morgan";

//imports
import { connectDb } from "./db/db.js";
import authRoutes from "./routes/authRoutes.js";
import studentRoutes from "./routes/studentProfileRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import jobsRoutes from "./routes/jobRoutes.js";
import alumniRoutes from "./routes/alumniRoutes.js";
import mentorRoutes from "./routes/mentorRoutes.js";
import { connectRedis } from "./cache/redisClient.js";

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS Configuration
const allowedOrigins = [
  'http://localhost:3000',
  process.env.FRONTEND_URL
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// Cookie parser with secret
app.use(cookieParser(process.env.JWT_SECRET));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

//basic route
app.get("/", (req: Request, res: Response) => {
  res.send("API running in backend");
});

//Using the imports
app.use("/api/v1", authRoutes);
app.use("/api/v1", studentRoutes);
app.use("/api/v1", eventRoutes);
app.use("/api/v1", jobsRoutes);
app.use("/api/v1", alumniRoutes);
app.use("/api/v1", mentorRoutes);

const port = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectRedis();
    
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.log(error);
  }
};

start();

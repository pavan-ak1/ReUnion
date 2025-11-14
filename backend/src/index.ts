import dotenv from "dotenv";
dotenv.config();
import express from "express";
import type { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

//To log all the incomming requests to the server
import morgan from "morgan";

//imports
import { connectDb } from "./db/db.js";
import { testConnection } from "./db/pool.js";
import authRoutes from "./routes/authRoutes.js";
import studentRoutes from "./routes/studentProfileRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import jobsRoutes from "./routes/jobRoutes.js";
import alumniRoutes from "./routes/alumniRoutes.js";
import mentorRoutes from "./routes/mentorshipRoutes.js";


const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS Configuration
const allowedOrigins = [
  'http://localhost:3000',
  // Add other allowed origins here in production
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin as string)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    
    // Handle preflight
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
  }
  next();
});

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
    console.log('Testing Neon DB connection...');
    const isConnected = await testConnection();
    if (!isConnected) {
      throw new Error('Failed to connect to Neon DB. Check your connection string and network.');
    }
    
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.log(error);
  }
};

start();

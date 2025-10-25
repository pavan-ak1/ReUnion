import { Pool } from "pg";
import dotenv from "dotenv";
dotenv.config()
const url = process.env.DATABASE_URL;

const isProduction = process.env.NODE_ENV === "production"; // or detect cloud

const pool = new Pool({
  connectionString: url,
  ssl: isProduction
    ? { rejectUnauthorized: false } // cloud DB
    : false,                         // local DB
});

// Event listeners
pool.on("connect", () => console.log("Connected to PostgreSQL database"));
pool.on("error", (err) => console.error("Unexpected DB error:", err));

export default pool;

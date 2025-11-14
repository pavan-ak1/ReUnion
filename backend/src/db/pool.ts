import { Pool } from "pg";
import dotenv from "dotenv";
dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,                 // Local can handle more
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 10000,
});

// Logs
pool.on("connect", () => console.log("🐘 Connected to local PostgreSQL"));
pool.on("error", (err) => console.error("⚠️ Local DB error:", err.message));

// Test connection
export const testConnection = async () => {
  const client = await pool.connect();
  try {
    const { rows } = await client.query('SELECT NOW() as now');
    console.log('Local DB connection test successful. Current time:', rows[0].now);
    return true;
  } catch (err) {
    console.error('Local DB connection test failed:', err);
    return false;
  } finally {
    client.release();
  }
};

export default pool;

// pool.ts
import { Pool } from "pg";
import dotenv from "dotenv";
dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Required for Neon
  },
  max: 3,                    // Neon works well with small pools
  idleTimeoutMillis: 10000,  // close idle clients after 10s
  connectionTimeoutMillis: 10000, // increased timeout for serverless
  query_timeout: 10000,      // query timeout in ms
  statement_timeout: 10000,  // statement timeout in ms
});

// Connection lifecycle logs
pool.on("connect", () => console.log("✅ Connected to Neon DB"));
pool.on("error", (err) => console.error("⚠️ Neon DB error:", err.message));

// Test connection function
export const testConnection = async () => {
  const client = await pool.connect();
  try {
    const { rows } = await client.query('SELECT NOW() as now');
    console.log('Neon DB connection test successful. Current time:', rows[0].now);
    return true;
  } catch (err) {
    console.error('Neon DB connection test failed:', err);
    return false;
  } finally {
    client.release();
  }
};

// Optional keep-alive (prevents Neon idle drops)
setInterval(async () => {
  try {
    await pool.query("SELECT 1");
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("🔁 Keep-alive failed:", msg);
  }
}, 45000); // ping every 45s

export default pool;

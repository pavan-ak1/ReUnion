import pkg from "pg";
const { Pool } = pkg;

const isLocal = process.env.DATABASE_URL?.includes("localhost") || process.env.DATABASE_URL?.includes("127.0.0.1");

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isLocal ? undefined : {
    rejectUnauthorized: false,
  },
});

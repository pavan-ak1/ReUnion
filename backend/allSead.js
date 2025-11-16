// hashAllPasswords.ts
import pg from "pg";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();
const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function hashAll() {
  const client = await pool.connect();
  try {
    const { rows } = await client.query("SELECT user_id, password FROM users");
    console.log(`Found ${rows.length} users. Hashing plaintext passwords...`);

    for (const u of rows) {
      const pwd = u.password;
      if (!pwd) continue;
      // Basic heuristic: bcrypt hashes start with $2
      if (pwd.startsWith("$2")) continue; // already hashed -> skip

      const hashed = await bcrypt.hash(pwd, 10);
      await client.query("UPDATE users SET password=$1 WHERE user_id=$2", [hashed, u.user_id]);
    }
    console.log("✅ All plaintext passwords hashed.");
  } catch (err) {
    console.error("❌ Error hashing passwords:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

hashAll().catch(e => console.error(e));

import "dotenv/config";
import { pool } from "../db/pool.js";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MODELS_DIR = path.join(__dirname, "../models");

const ORDERED_FILES = [
  "users.sql",             // Base table and ENUMs
  "students.sql",          // Depends on users
  "alumni.sql",            // Depends on users
  "mentors.sql",           // Depends on alumni
  "events.sql",            // Depends on users
  "jobs.sql",             // Depends on alumni
  "job_applications.sql", // Depends on jobs, students
  "mentor_requests.sql",   // Depends on students, mentors
  "student_events.sql",    // Depends on students, events
];

async function initDb() {
  const client = await pool.connect();
  
  try {
    console.log("Starting database initialization...");

    for (const file of ORDERED_FILES) {
      const filePath = path.join(MODELS_DIR, file);
      console.log(`Executing ${file}...`);
      
      const sql = await fs.readFile(filePath, "utf-8");
      
      // Split by semi-colon to handle multiple statements if any, 
      // though typically we should execute the whole file. 
      // pg driver can handle multiple statements in one query call usually.
      await client.query(sql);
      
      console.log(`✅ ${file} executed successfully.`);
    }

    console.log("🎉 Database initialized successfully!");
  } catch (err) {
    console.error("❌ Error initializing database:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

initDb();

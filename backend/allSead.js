// seed500.ts
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();
const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Helpers for deterministic generation
const FIRST_NAMES = [
  "Arjun","Kavya","Pavan","Neha","Rahul","Sahana","Vikas","Meera","Rohit","Sneha",
  "Abhinav","Kiran","Harsha","Shruti","Amit","Rakesh","Divya","Vignesh","Sandhya",
  "Pranav","Tanvi","Ishan","Varun","Nisha","Sudeep","Ritu","Sharan","Karthik",
  "Pooja","Ananya","Lokesh","Sameer","Charan","Shreya","Tejas","Ravi","Raman",
  "Harini","Yash","Manya","Deepak","Gaurav","Tarun","Vivek","Radhika","Sanjana",
  "Shravya","Aarav","Kabir","Aryan","Nithin","Keerthi","Preeti","Karthika","Rohini",
  "Nandini","Shreyan","Ajay","Vishnu","Lalith","Revanth","Srinivas","Arvind","Bharath",
  "Sumanth","Jahnavi","Sanjay","Pratyush","Aditya","Sakshi","Lekha","Hemant","Jeevan",
  "Nirmala","Viveka","Charitha","Mallika","Anusha","Prerana","Punith","Mithun","Rhea",
  "Prajwal","Naveen","Tarika","Jonas","Ethan","Liam","Noah","Mila","Lara","Aanya","Tara"
];

const LAST_NAMES = [
  "Mehta","Rao","Kumar","Singh","Verma","Sharma","Iyer","Menon","Kulkarni","Nair",
  "Shetty","Pai","Patel","Gowda","Naik","Reddy","Bhat","Shastri","Shah"
];

function rnd(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randomRole() { return Math.random() < 0.6 ? "student" : "alumni"; }
function randomDateIn2025() {
  const month = Math.floor(Math.random() * 12);
  const day = 1 + Math.floor(Math.random() * 28);
  return new Date(2025, month, day);
}

async function seed() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    console.log("1) Inserting 500 users (password = 'secret')...");
    const insertedUsers = [];

    for (let i = 0; i < 500; i++) {
      const first = FIRST_NAMES[i % FIRST_NAMES.length];
      const last = LAST_NAMES[i % LAST_NAMES.length];
      const name = `${first} ${last}`;
      // email unique via index
      const email = `${first.toLowerCase()}.${last.toLowerCase()}.${i}@example.com`;
      const phone = `98765${String(10000 + i).slice(-4)}`;
      const role = randomRole();

      const res = await client.query(
        `INSERT INTO users (name, email, phone, password, role) VALUES ($1,$2,$3,'secret',$4) RETURNING user_id, role;`,
        [name, email, phone, role]
      );
      insertedUsers.push(res.rows[0]);
      if ((i+1) % 50 === 0) console.log(`  -> ${i+1} users inserted`);
    }

    const studentUsers = insertedUsers.filter(u => u.role === "student");
    const alumniUsers = insertedUsers.filter(u => u.role === "alumni");
    console.log(`  total students: ${studentUsers.length}, alumni: ${alumniUsers.length}`);

    // 2) students
    console.log("2) Inserting students...");
    for (const s of studentUsers) {
      await client.query(
        `INSERT INTO students (user_id, enrollment_year, degree, department, expected_graduation)
         VALUES ($1, $2, 'B.Tech', $3, $4)`,
         [s.user_id, 2020 + Math.floor(Math.random() * 4), rnd(["CSE","ECE","ISE","EEE","ME","Civil"]), 2024 + Math.floor(Math.random() * 4)]
      );
    }

    // 3) alumni
    console.log("3) Inserting alumni...");
    for (const a of alumniUsers) {
      await client.query(
        `INSERT INTO alumni (user_id, graduation_year, degree, department, current_position, company, location)
         VALUES ($1, $2, 'B.Tech', $3, $4, $5, $6)`,
        [a.user_id, 2010 + Math.floor(Math.random() * 12), rnd(["CSE","ECE","ISE","EEE","ME","Civil"]),
         rnd(["Software Engineer","Data Scientist","Consultant","Tech Lead","Architect","Manager"]),
         rnd(["Google","Amazon","Microsoft","Infosys","TCS","Deloitte","L&T","IBM"]),
         rnd(["Bangalore","Hyderabad","Pune","Chennai","Mumbai","Delhi"])]
      );
    }

    // 4) mentors (take up to 25% of alumni as mentors)
    console.log("4) Creating mentors...");
    const mentorCount = Math.max(1, Math.floor(alumniUsers.length * 0.25));
    const mentors = alumniUsers.slice(0, mentorCount);
    for (const m of mentors) {
      await client.query(
        `INSERT INTO mentors (alumni_id, expertise, availability, max_mentees) VALUES ($1, $2, TRUE, $3)`,
        [m.user_id, rnd(["AI/ML","Cloud","Cybersecurity","IoT","Full Stack","Embedded","Distributed Systems"]), 2 + Math.floor(Math.random() * 6)]
      );
    }
    console.log(`  mentors created: ${mentors.length}`);

    // 5) events (create 120 events)
    console.log("5) Creating 120 events...");
    const eventIDs = [];
    for (let i = 0; i < 120; i++) {
      const organizer = rnd(alumniUsers);
      const res = await client.query(
        `INSERT INTO events (organizer_id, event_name, description, date, location) 
         VALUES ($1, $2, $3, $4, $5) RETURNING event_id`,
         [organizer.user_id, `Event ${i+1}`, `Auto-generated event ${i+1}`, randomDateIn2025(), rnd(["Hall A","Seminar Hall","Auditorium","ECE Block","Lab 1"])]
      );
      eventIDs.push(res.rows[0].event_id);
    }

    // 6) student_events (register each student to 1-3 events)
    console.log("6) Registering students to events...");
    for (const s of studentUsers) {
      const registrations = 1 + Math.floor(Math.random() * 3);
      const used = new Set();
      for (let r = 0; r < registrations; r++) {
        const e = rnd(eventIDs);
        if (used.has(e)) continue;
        used.add(e);
        await client.query(`INSERT INTO student_events (student_id, event_id) VALUES ($1,$2) ON CONFLICT DO NOTHING`, [s.user_id, e]);
      }
    }

    // 7) jobs (create 300 jobs posted by alumni)
    console.log("7) Creating 300 jobs...");
    const jobIDs = [];
    for (let i = 0; i < 300; i++) {
      const poster = rnd(alumniUsers);
      const res = await client.query(
        `INSERT INTO jobs (alumni_id, job_title, company, job_description, location, employment_type, application_deadline)
         VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING job_id`,
        [poster.user_id, rnd(["SDE","Data Analyst","Frontend","Backend","DevOps","Intern"]), rnd(["Google","Amazon","Flipkart","Infosys","TCS","IBM"]),
         `Job ${i+1} description`, rnd(["Bangalore","Hyderabad","Pune","Chennai","Mumbai"]), rnd(["Full-time","Internship"]), randomDateIn2025()]
      );
      jobIDs.push(res.rows[0].job_id);
    }

    // 8) job_applications (create 1200 applications)
    console.log("8) Creating 1200 job applications...");
    for (let k = 0; k < 1200; k++) {
      const job = rnd(jobIDs);
      const student = rnd(studentUsers).user_id;
      await client.query(
        `INSERT INTO job_applications (job_id, student_id) VALUES ($1,$2) ON CONFLICT DO NOTHING`,
        [job, student]
      );
    }

    // 9) mentorship_requests (create 800 requests between students and mentors)
    console.log("9) Creating mentorship requests...");
    for (let k = 0; k < 800; k++) {
      const student = rnd(studentUsers).user_id;
      const mentor = rnd(mentors).user_id;
      await client.query(
        `INSERT INTO mentorship_requests (student_id, mentor_id, status) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING`,
        [student, mentor, rnd(["Pending","Accepted","Rejected"])]
      );
    }

    await client.query("COMMIT");
    console.log("🎉 SEED COMPLETE: 500 users + related data inserted (passwords = 'secret').");

  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ SEED FAILED:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch(e => console.error(e));

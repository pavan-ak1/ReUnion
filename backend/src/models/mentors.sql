CREATE TABLE mentors (
  mentor_id SERIAL PRIMARY KEY,
  alumni_id INT UNIQUE REFERENCES users(user_id) ON DELETE CASCADE,
  expertise TEXT NOT NULL,
  availability BOOLEAN DEFAULT TRUE,
  max_mentees INT DEFAULT 5,
  created_at TIMESTAMP DEFAULT NOW()
);

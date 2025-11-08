CREATE TABLE mentorship_requests (
  request_id SERIAL PRIMARY KEY,
  student_id INT REFERENCES users(user_id) ON DELETE CASCADE,
  mentor_id INT REFERENCES mentors(mentor_id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'Pending', -- Pending / Accepted / Rejected
  requested_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (student_id, mentor_id)
);

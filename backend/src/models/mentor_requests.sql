CREATE TABLE mentorship_requests (
    request_id SERIAL PRIMARY KEY,
    student_id INT REFERENCES students(user_id) ON DELETE CASCADE,
    mentor_id INT REFERENCES mentors(alumni_id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'Pending',
    requested_at TIMESTAMP DEFAULT NOW(),
    UNIQUE (student_id, mentor_id)
);


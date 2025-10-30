CREATE TABLE job_applications (
    application_id SERIAL PRIMARY KEY,
    job_id INT REFERENCES jobs(job_id) ON DELETE CASCADE,
    student_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'Applied',   -- Applied / Shortlisted / Hired
    applied_at TIMESTAMP DEFAULT NOW(),
    UNIQUE (job_id, student_id)
);


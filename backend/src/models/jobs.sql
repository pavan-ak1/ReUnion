CREATE TABLE jobs (
    job_id SERIAL PRIMARY KEY,
    alumni_id INT REFERENCES users(user_id) ON DELETE SET NULL,
    job_title VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    job_description TEXT,
    location VARCHAR(255),
    employment_type VARCHAR(50),     -- e.g., Internship / Full-time
    posted_date TIMESTAMP DEFAULT NOW(),
    application_deadline DATE
);

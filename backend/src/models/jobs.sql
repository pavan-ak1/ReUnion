CREATE TABLE jobs (
    job_id SERIAL PRIMARY KEY,
    alumni_id INT REFERENCES alumni(user_id) ON DELETE CASCADE,
    job_title VARCHAR(100) NOT NULL,
    company VARCHAR(100) NOT NULL,
    job_description TEXT,
    location VARCHAR(100),
    employment_type VARCHAR(50),
    application_deadline DATE,
    posted_date TIMESTAMP DEFAULT NOW()
);
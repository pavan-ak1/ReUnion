CREATE TABLE mentors (
    alumni_id INT PRIMARY KEY REFERENCES alumni(user_id) ON DELETE CASCADE,
    expertise TEXT NOT NULL,
    availability BOOLEAN DEFAULT TRUE,
    max_mentees INT DEFAULT 5,
    created_at TIMESTAMP DEFAULT NOW()
);

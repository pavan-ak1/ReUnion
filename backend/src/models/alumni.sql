CREATE TABLE alumni (
    user_id INT PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
    graduation_year INT NOT NULL,
    degree VARCHAR(100),
    department VARCHAR(100),
    current_position VARCHAR(100),
    company VARCHAR(100),
    location VARCHAR(100)
);
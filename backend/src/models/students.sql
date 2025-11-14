CREATE TABLE students (
    user_id INT PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
    enrollment_year INT NOT NULL,
    degree VARCHAR(100),
    department VARCHAR(100),
    expected_graduation INT
);


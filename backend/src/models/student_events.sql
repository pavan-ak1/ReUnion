CREATE TABLE student_events (
    student_id INT REFERENCES students(user_id) ON DELETE CASCADE,
    event_id INT REFERENCES events(event_id) ON DELETE CASCADE,
    registered_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (student_id, event_id)
);
CREATE TABLE events (
    event_id SERIAL PRIMARY KEY,
    organizer_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    event_name VARCHAR(150) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    location VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

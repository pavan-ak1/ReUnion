create table students(
  student_id serial primary key,
  user_id int unique REFERENCES users(user_id) on DELETE cascade,
  enrollment_year int not null,
  degree varchar(100),
  department VARCHAR(100),
  expected_graduation INT
);
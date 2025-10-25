create table alumni(
  alumni_id serial PRIMARY key,
  user_id int unique references users(user_id) on delete cascade,
  graduation_year int not null,
  degree varchar(100),
  department varchar(100),
  current_position varchar(100),
  company varchar(100),
  location VARCHAR(100)
);
CREATE TYPE user_role AS ENUM ('student', 'alumni', 'admin');

create table users(
  user_id serial primary key,
  name varchar(100) not null,
  email varchar(100) unique not null,
  phone varchar(15) unique,
  password varchar(100) not null,
  role user_role not null,
  created_at timestamp default now()
);
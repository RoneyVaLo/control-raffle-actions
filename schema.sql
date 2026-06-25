-- Run this SQL in your Supabase SQL Editor to create the database schema

create table sections (
  id uuid primary key default gen_random_uuid(),
  name varchar(50) unique not null,
  created_at timestamp default now()
);

create table students (
  id uuid primary key default gen_random_uuid(),
  full_name varchar(255) not null,
  section_id uuid references sections(id),
  created_at timestamp default now()
);

create table raffle_actions (
  id uuid primary key default gen_random_uuid(),
  action_number integer unique not null,
  student_id uuid references students(id),
  status varchar(20) not null default 'PENDING',
  payment_method varchar(20),
  assigned_at timestamp default now(),
  paid_at timestamp,
  updated_at timestamp default now()
);

create index idx_action_number on raffle_actions(action_number);
create index idx_student_id on raffle_actions(student_id);
create index idx_status on raffle_actions(status);

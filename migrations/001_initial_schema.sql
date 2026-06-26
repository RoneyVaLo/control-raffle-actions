-- Migration: 001_initial_schema
-- Description: Creates sections, students, and raffle_actions tables with seed data
-- Run this SQL in your Supabase SQL Editor

-- ============================================================
-- TABLES
-- ============================================================

create table if not exists sections (
  id uuid primary key default gen_random_uuid(),
  name varchar(50) unique not null,
  created_at timestamp default now()
);

create table if not exists students (
  id uuid primary key default gen_random_uuid(),
  full_name varchar(255) not null,
  section_id uuid references sections(id),
  created_at timestamp default now()
);

create table if not exists raffle_actions (
  id uuid primary key default gen_random_uuid(),
  action_number integer unique not null,
  student_id uuid references students(id),
  status varchar(20) not null default 'PENDING',
  payment_method varchar(20),
  assigned_at timestamp default now(),
  paid_at timestamp,
  updated_at timestamp default now()
);

-- ============================================================
-- INDEXES
-- ============================================================

create index if not exists idx_action_number on raffle_actions(action_number);
create index if not exists idx_student_id on raffle_actions(student_id);
create index if not exists idx_status on raffle_actions(status);

-- ============================================================
-- SEED DATA
-- ============================================================

insert into sections (id, name) values
  ('a1b2c3d4-0001-4000-8000-000000000001', '7-1'),
  ('a1b2c3d4-0001-4000-8000-000000000002', '7-2')
on conflict (id) do nothing;

insert into students (id, full_name, section_id) values
  ('b2c3d4e5-0001-4000-8000-000000000001', 'María López', 'a1b2c3d4-0001-4000-8000-000000000001'),
  ('b2c3d4e5-0001-4000-8000-000000000002', 'Carlos Mora', 'a1b2c3d4-0001-4000-8000-000000000002')
on conflict (id) do nothing;

insert into raffle_actions (id, action_number, student_id, status, payment_method, paid_at) values
  (
    'c3d4e5f6-0001-4000-8000-000000000001',
    1001,
    'b2c3d4e5-0001-4000-8000-000000000001',
    'PAID',
    'SINPE',
    now()
  ),
  (
    'c3d4e5f6-0001-4000-8000-000000000002',
    1002,
    'b2c3d4e5-0001-4000-8000-000000000002',
    'PENDING',
    null,
    null
  )
on conflict (id) do nothing;

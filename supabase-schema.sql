-- Merry and Pippin Growth Tracker: Database schema for Supabase
-- Run this in your Supabase SQL Editor

-- Cats table
create table cats (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  breed text not null default 'British Shorthair',
  color text not null default 'Golden',
  date_of_birth date,
  photo_url text,
  created_at timestamptz default now()
);

-- Weight records
create table weight_records (
  id uuid default gen_random_uuid() primary key,
  cat_id uuid references cats(id) on delete cascade not null,
  weight_kg numeric(5,2) not null,
  recorded_at date not null default current_date,
  notes text,
  created_at timestamptz default now()
);

-- Health records (vaccines, deworming, vet visits)
create table health_records (
  id uuid default gen_random_uuid() primary key,
  cat_id uuid references cats(id) on delete cascade not null,
  record_type text not null check (record_type in ('vaccine', 'deworm', 'vet_visit', 'medication', 'other')),
  title text not null,
  description text,
  date date not null default current_date,
  next_due_date date,
  created_at timestamptz default now()
);

-- Food logs
create table food_logs (
  id uuid default gen_random_uuid() primary key,
  cat_id uuid references cats(id) on delete cascade not null,
  food_name text not null,
  food_type text not null check (food_type in ('wet', 'dry', 'treat', 'supplement')),
  amount_grams numeric(6,1),
  meal_time text not null check (meal_time in ('breakfast', 'lunch', 'dinner', 'snack')),
  date date not null default current_date,
  notes text,
  created_at timestamptz default now()
);

-- Photos
create table photos (
  id uuid default gen_random_uuid() primary key,
  cat_id uuid references cats(id) on delete set null,
  url text not null,
  caption text,
  taken_at timestamptz,
  created_at timestamptz default now()
);

-- Seed data: Merry & Pippin
insert into cats (name, breed, color) values
  ('Merry', 'British Shorthair', 'Golden'),
  ('Pippin', 'British Shorthair', 'Golden');

-- Create indexes for performance
create index idx_weight_records_cat_id on weight_records(cat_id);
create index idx_weight_records_date on weight_records(recorded_at);
create index idx_health_records_cat_id on health_records(cat_id);
create index idx_health_records_date on health_records(date);
create index idx_food_logs_cat_id on food_logs(cat_id);
create index idx_food_logs_date on food_logs(date);
create index idx_photos_cat_id on photos(cat_id);

-- Enable RLS (Row Level Security) - disabled for personal use
-- If you want to add auth later, enable these:
-- alter table cats enable row level security;
-- alter table weight_records enable row level security;
-- alter table health_records enable row level security;
-- alter table food_logs enable row level security;
-- alter table photos enable row level security;

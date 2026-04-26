-- profiles: ユーザーの収入・家族情報
create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  annual_income integer not null,
  age integer not null default 30,
  employment_type text not null check (employment_type in ('employee', 'part_time', 'self_employed')),
  family_type text not null check (family_type in ('single', 'couple', 'family_with_child')),
  has_dependent boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);

-- tax_tasks: 診断結果から生成された節税タスク
create table if not exists tax_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  task_type text not null,
  title text not null,
  description text not null,
  estimated_saving integer not null default 0,
  priority integer not null default 5,
  is_completed boolean not null default false,
  completed_at timestamptz,
  affiliate_url text,
  created_at timestamptz not null default now()
);

-- RLS
alter table profiles enable row level security;
alter table tax_tasks enable row level security;

create policy "users can manage own profile"
  on profiles for all using (auth.uid() = user_id);

create policy "users can manage own tasks"
  on tax_tasks for all using (auth.uid() = user_id);

-- インデックス
create index on tax_tasks (user_id, estimated_saving desc);

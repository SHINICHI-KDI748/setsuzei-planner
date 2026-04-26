-- 支出データ（CSV インポート）
create table if not exists expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  description text not null,
  amount integer not null,
  category text not null default 'other',
  created_at timestamptz not null default now()
);

alter table expenses enable row level security;

create policy "users can manage own expenses"
  on expenses for all using (auth.uid() = user_id);

create index on expenses (user_id, date desc);

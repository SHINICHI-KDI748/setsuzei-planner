-- 課金ユーザー管理
create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  stripe_customer_id text,
  stripe_subscription_id text,
  status text not null default 'inactive'
    check (status in ('active', 'inactive', 'canceled', 'past_due')),
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);

alter table subscriptions enable row level security;

create policy "users can read own subscription"
  on subscriptions for select using (auth.uid() = user_id);

-- serviceロールのみ書き込み可（webhookから更新）
create policy "service can manage subscriptions"
  on subscriptions for all using (auth.role() = 'service_role');

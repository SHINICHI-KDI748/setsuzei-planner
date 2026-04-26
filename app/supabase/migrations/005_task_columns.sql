alter table tax_tasks
  add column if not exists action_steps text[] not null default '{}',
  add column if not exists affiliate_label text;

-- パフォーマンス最適化インデックス

-- tax_tasks: 未完了タスクのみの高速取得
create index if not exists idx_tax_tasks_incomplete
  on tax_tasks (user_id, estimated_saving desc)
  where is_completed = false;

-- subscriptions: アクティブ課金ユーザーの高速検索
create index if not exists idx_subscriptions_active
  on subscriptions (user_id)
  where status = 'active';

-- expenses: 日付降順インデックス（月次集計クエリはレンジスキャンで対応）
create index if not exists idx_expenses_monthly
  on expenses (user_id, date desc);

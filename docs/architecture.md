# システムアーキテクチャ（Phase1 MVP）

## 構成図

```
[ブラウザ]
    │
    ▼
[Next.js 14 / Vercel]
  ├── App Router (src/app/)
  │     ├── (auth)/login        ← メール認証
  │     └── (app)/
  │           ├── dashboard     ← 節税額サマリ・進捗
  │           ├── diagnosis     ← 診断フォーム
  │           └── tasks         ← タスク一覧・チェック
  └── API Routes
        ├── POST /api/diagnosis ← 診断ロジック実行
        ├── GET  /api/tasks     ← タスク一覧取得
        ├── PATCH /api/tasks/[id] ← 完了チェック
        └── GET  /api/dashboard ← 集計データ
            │
            ▼
[Supabase]
  ├── Auth (メール認証)
  └── PostgreSQL
        ├── profiles   ← 年収・家族構成
        └── tax_tasks  ← 節税タスク（診断結果）
```

## ディレクトリ構成

```
app/
├── src/
│   ├── app/
│   │   ├── (auth)/login/          ← 認証ページ
│   │   ├── (app)/
│   │   │   ├── dashboard/         ← ダッシュボード
│   │   │   ├── diagnosis/         ← 節税診断
│   │   │   └── tasks/             ← タスク管理
│   │   └── api/
│   │       ├── diagnosis/route.ts
│   │       ├── tasks/route.ts
│   │       ├── tasks/[id]/route.ts
│   │       └── dashboard/route.ts
│   ├── components/
│   │   ├── ui/                    ← 汎用UIパーツ
│   │   ├── diagnosis/             ← 診断フォーム
│   │   ├── tasks/                 ← タスクリスト
│   │   └── dashboard/             ← ダッシュボードカード
│   ├── lib/
│   │   ├── diagnosis.ts           ← 節税計算ロジック
│   │   └── supabase/{client,server}.ts
│   └── types/index.ts
├── supabase/migrations/001_init.sql
└── .env.local.example
```

## DB設計

### profiles
| カラム | 型 | 説明 |
|---|---|---|
| id | uuid PK | |
| user_id | uuid FK→auth.users | |
| annual_income | integer | 年収（円） |
| age | integer | 年齢 |
| employment_type | text | employee/part_time/self_employed |
| family_type | text | single/couple/family_with_child |
| has_dependent | boolean | 扶養あり |

### tax_tasks
| カラム | 型 | 説明 |
|---|---|---|
| id | uuid PK | |
| user_id | uuid FK→auth.users | |
| task_type | text | ideco/furusato/nisa等 |
| title | text | タスク名 |
| description | text | 説明 |
| estimated_saving | integer | 節税見込み額（円） |
| priority | integer | 優先度（小さいほど高） |
| is_completed | boolean | 完了フラグ |
| completed_at | timestamptz | 完了日時 |
| affiliate_url | text | アフィリエイトリンク（後で追加） |

## API一覧

| Method | Path | 認証 | 説明 |
|---|---|---|---|
| POST | /api/diagnosis | 任意 | 診断実行・タスク生成 |
| GET | /api/tasks | 必須 | タスク一覧（節税額降順） |
| PATCH | /api/tasks/[id] | 必須 | 完了チェック |
| GET | /api/dashboard | 必須 | 集計データ取得 |

## 節税ロジック（MVP版）

診断対象：
1. iDeCo（所得控除・最大55,200円/年）
2. ふるさと納税（年収連動上限）
3. 新NISA（運用益非課税）
4. 医療費控除（10万円超で控除）
5. 扶養・配偶者控除（最大76,000円/年）
6. 生命保険料控除（最大24,000円/年）

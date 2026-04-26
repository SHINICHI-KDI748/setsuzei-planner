# PR: Phase1〜6 全フェーズ実装完了

## 概要
節税プランナーMVPの全フェーズ（アーキテクチャ設計・バックエンド・フロントエンド・課金・支出分析・アフィリエイト・マーケティング自動化）を実装した。

---

## Phase1: MVP基盤

### Step1: アーキテクチャ
- Next.js 14 + TypeScript + Tailwind + Supabase の基盤構築
- 型定義・節税計算ロジック・APIルート・DBマイグレーション

### Step2: バックエンド認証
- `src/middleware.ts` — 認証保護ルート
- `src/app/auth/callback/route.ts` — Supabase メールリンク認証

### Step3: フロントエンドUI
- LP（問題提起→数値→CTA）
- 診断フォーム（年収・雇用形態・家族構成）
- タスク一覧（楽観的UI更新）
- ダッシュボード（節税額・進捗）

### Step4: 統合
- `src/lib/api.ts` で API 呼び出しを集約
- 未ログインでも診断可能な2段階フロー

---

## Phase2: 初回リリース

### Step1: Vercelデプロイ設定
- `app/vercel.json` — ビルド設定
- `.github/workflows/deploy.yml` — CI/CD（型チェック→ビルド→デプロイ）

### Step2: note記事
- `content/note/article_01_income500_tax_loss.md` — 2,000字の集客記事（そのまま投稿可）

### Step3〜4: X投稿
- `content/x_posts.md` — 2週間分の投稿テキスト（10件）
- `scripts/post_to_x.sh` — 手動投稿スクリプト

---

## Phase3: 初マネタイズ

### Step1: Stripe課金
- `/api/stripe/checkout` — サブスクセッション作成
- `/api/stripe/portal` — 解約・プラン変更
- `/api/stripe/webhook` — 課金状態の DB 同期
- `/upgrade` — 料金ページ（¥980/月）
- `supabase/migrations/002_subscriptions.sql`

### Step2: 成果可視化
- `SavingReport` コンポーネント — 節税額・進捗・アップセル導線
- ダッシュボードをプレミアム/非プレミアムで出し分け

---

## Phase4: 支出分析

### Step1: CSVアップロード（OCR代替）
- `src/lib/expenses.ts` — CSV パース + ルールベース分類 + 削減提案
- `/api/expenses` — アップロード・分析API
- `/expenses` — 支出分析ページ（カテゴリ内訳・削減提案）
- `supabase/migrations/003_expenses.sql`

---

## Phase5: スケール

### Step1: アフィリエイト導線
- iDeCo → SBI証券リンク
- ふるさと納税 → 楽天リンク
- NISA → SBI証券リンク
- タスクカードの「今すぐ申し込む」ボタンに自動付与

### Step2: DB最適化
- `supabase/migrations/004_performance.sql` — 部分インデックス3本

---

## Phase6: 自動化

### Step1: X継続投稿
- `scripts/generate_x_post.ts` — 5テーマをローテーションしてテキスト生成
- `.github/workflows/x_auto_post.yml` — 毎日朝7時・夜21時に自動投稿

---

## 全ルート（17）
```
/ /_not-found /api/dashboard /api/diagnosis /api/expenses
/api/stripe/checkout /api/stripe/portal /api/stripe/webhook
/api/tasks /api/tasks/[id] /auth/callback
/dashboard /diagnosis /expenses /login /tasks /upgrade
```

## 環境変数（必須）
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
STRIPE_SECRET_KEY
STRIPE_PRICE_ID_MONTHLY
STRIPE_WEBHOOK_SECRET
NEXT_PUBLIC_APP_URL
X_API_KEY / X_API_SECRET / X_ACCESS_TOKEN / X_ACCESS_SECRET
```

## 次のアクション（人手が必要）
1. Supabase プロジェクト作成 → マイグレーション実行
2. Stripe 商品・価格ID作成 → Webhook 登録
3. GitHub Secrets 設定
4. Vercel にデプロイ（app/ ディレクトリを指定）
5. note記事 `content/note/article_01_income500_tax_loss.md` を投稿

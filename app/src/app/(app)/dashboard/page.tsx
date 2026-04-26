import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { SavingReport } from "@/components/dashboard/SavingReport"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import Link from "next/link"

function fmt(n: number) {
  return n.toLocaleString("ja-JP")
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const [{ data: tasks }, { data: sub }] = await Promise.all([
    supabase
      .from("tax_tasks")
      .select("*")
      .eq("user_id", user.id)
      .order("estimated_saving", { ascending: false }),
    supabase
      .from("subscriptions")
      .select("status")
      .eq("user_id", user.id)
      .single(),
  ])

  const hasTasks = tasks && tasks.length > 0
  const isPremium = sub?.status === "active"
  const totalSaving = tasks?.reduce((s: number, t: { estimated_saving: number }) => s + t.estimated_saving, 0) ?? 0
  const completed = tasks?.filter((t: { is_completed: boolean }) => t.is_completed) ?? []
  const actualSaving = completed.reduce((s: number, t: { estimated_saving: number }) => s + t.estimated_saving, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ホーム</h1>
          {isPremium && (
            <span className="inline-block mt-1 text-xs bg-emerald-600 text-white px-2 py-0.5 rounded-full font-medium">
              プレミアム
            </span>
          )}
        </div>
        {!isPremium && (
          <Link href="/upgrade">
            <Button variant="secondary" className="text-xs py-2">アップグレード</Button>
          </Link>
        )}
      </div>

      {!hasTasks ? (
        <Card className="text-center py-12">
          <p className="text-4xl mb-4">💰</p>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">まず節税診断をしよう</h2>
          <p className="text-sm text-gray-500 mb-6">
            年収・家族構成を入力するだけで<br />あなた専用の節税プランを自動生成します
          </p>
          <Link href="/diagnosis">
            <Button>無料で診断する →</Button>
          </Link>
        </Card>
      ) : (
        <>
          <SavingReport
            totalSaving={totalSaving}
            actualSaving={actualSaving}
            completedTasks={completed.length}
            totalTasks={tasks!.length}
            isPremium={isPremium}
          />

          <Card>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-semibold text-gray-700">優先タスク</h2>
              <Link href="/tasks" className="text-xs text-emerald-600 hover:underline">すべて見る →</Link>
            </div>
            <ul className="space-y-3">
              {tasks!.filter((t: { is_completed: boolean }) => !t.is_completed).slice(0, 3).map((t: { id: string; title: string; estimated_saving: number }) => (
                <li key={t.id} className="flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-amber-400 flex-shrink-0" />
                  <span className="text-sm flex-1 text-gray-700">{t.title}</span>
                  <span className="text-xs font-medium text-emerald-600">¥{fmt(t.estimated_saving)}</span>
                </li>
              ))}
            </ul>
          </Card>
        </>
      )}
    </div>
  )
}

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { TaskList } from "@/components/tasks/TaskList"
import { Button } from "@/components/ui/Button"
import Link from "next/link"
import type { TaxTask } from "@/types"

export default async function TasksPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: tasks } = await supabase
    .from("tax_tasks")
    .select("*")
    .eq("user_id", user.id)
    .order("estimated_saving", { ascending: false })

  const hasTasks = tasks && tasks.length > 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">タスク</h1>
          <p className="mt-1 text-sm text-gray-500">実行したら チェックを入れよう</p>
        </div>
        <Link href="/diagnosis">
          <Button variant="secondary" className="text-xs py-2">再診断</Button>
        </Link>
      </div>

      {hasTasks ? (
        <TaskList initialTasks={tasks as TaxTask[]} />
      ) : (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-sm mb-4">タスクがありません。まず節税診断をしましょう。</p>
          <Link href="/diagnosis">
            <Button>診断する →</Button>
          </Link>
        </div>
      )}
    </div>
  )
}

import type { DiagnosisInput, DiagnosisResult, DashboardData, TaxTask } from "@/types"

export async function diagnose(input: DiagnosisInput): Promise<DiagnosisResult> {
  const res = await fetch("/api/diagnosis", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })
  if (!res.ok) throw new Error("診断に失敗しました")
  return res.json()
}

export async function fetchTasks(): Promise<TaxTask[]> {
  const res = await fetch("/api/tasks")
  if (!res.ok) throw new Error("タスクの取得に失敗しました")
  return res.json()
}

export async function toggleTask(id: string, is_completed: boolean): Promise<TaxTask> {
  const res = await fetch(`/api/tasks/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ is_completed }),
  })
  if (!res.ok) throw new Error("タスクの更新に失敗しました")
  return res.json()
}

export async function fetchDashboard(): Promise<DashboardData> {
  const res = await fetch("/api/dashboard")
  if (!res.ok) throw new Error("ダッシュボードの取得に失敗しました")
  return res.json()
}

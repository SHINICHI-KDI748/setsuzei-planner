import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import type { DashboardData } from "@/types"

export const dynamic = "force-dynamic"

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: tasks, error } = await supabase
    .from("tax_tasks")
    .select("*")
    .eq("user_id", user.id)
    .order("estimated_saving", { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const total_estimated_saving = tasks?.reduce((s, t) => s + t.estimated_saving, 0) ?? 0
  const completed = tasks?.filter((t) => t.is_completed) ?? []
  const total_actual_saving = completed.reduce((s, t) => s + t.estimated_saving, 0)

  const dashboard: DashboardData = {
    total_estimated_saving,
    total_actual_saving,
    completed_tasks: completed.length,
    total_tasks: tasks?.length ?? 0,
    tasks: tasks ?? [],
  }

  return NextResponse.json(dashboard)
}

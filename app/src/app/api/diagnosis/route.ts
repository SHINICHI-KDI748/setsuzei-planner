import { NextRequest, NextResponse } from "next/server"
import { runDiagnosis } from "@/lib/diagnosis"
import { createClient } from "@/lib/supabase/server"
import type { DiagnosisInput } from "@/types"

export async function POST(req: NextRequest) {
  const input: DiagnosisInput = await req.json()

  if (!input.annual_income || !input.employment_type) {
    return NextResponse.json({ error: "必須パラメータが不足しています" }, { status: 400 })
  }

  const result = runDiagnosis(input)

  // ログイン済みならタスクをDBに保存
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    // プロフィール upsert
    await supabase.from("profiles").upsert({
      user_id: user.id,
      annual_income: input.annual_income,
      age: input.age,
      employment_type: input.employment_type,
      family_type: input.family_type,
      has_dependent: input.has_dependent,
      updated_at: new Date().toISOString(),
    })

    // 既存タスクを削除して再生成
    await supabase.from("tax_tasks").delete().eq("user_id", user.id)
    await supabase.from("tax_tasks").insert(
      result.tasks.map((t) => ({
        user_id: user.id,
        ...t,
        is_completed: false,
      }))
    )
  }

  return NextResponse.json(result)
}

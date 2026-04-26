import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { parseCSV, analyzeSavings } from "@/lib/expenses"

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get("file") as File | null
  if (!file) return NextResponse.json({ error: "ファイルがありません" }, { status: 400 })

  const text = await file.text()
  const parsed = parseCSV(text)
  if (parsed.length === 0) {
    return NextResponse.json({ error: "CSVの形式が正しくありません（日付,説明,金額 の順で並べてください）" }, { status: 400 })
  }

  await supabase.from("expenses").delete().eq("user_id", user.id)
  await supabase.from("expenses").insert(
    parsed.map((e) => ({ user_id: user.id, ...e }))
  )

  return NextResponse.json(analyzeSavings(parsed))
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: expenses } = await supabase
    .from("expenses")
    .select("*")
    .eq("user_id", user.id)
    .order("date", { ascending: false })

  if (!expenses || expenses.length === 0) {
    return NextResponse.json(null)
  }

  return NextResponse.json(analyzeSavings(expenses))
}

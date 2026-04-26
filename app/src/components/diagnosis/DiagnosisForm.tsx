"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { diagnose } from "@/lib/api"
import type { DiagnosisInput, DiagnosisResult } from "@/types"

const INCOME_OPTIONS = [
  { label: "300万円未満", value: 2500000 },
  { label: "300〜400万円", value: 3500000 },
  { label: "400〜500万円", value: 4500000 },
  { label: "500〜600万円", value: 5500000 },
  { label: "600〜800万円", value: 7000000 },
  { label: "800万円以上", value: 9000000 },
]

function fmt(n: number) {
  return n.toLocaleString("ja-JP")
}

export function DiagnosisForm() {
  const router = useRouter()
  const [step, setStep] = useState<"form" | "result">("form")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<DiagnosisResult | null>(null)
  const [form, setForm] = useState<DiagnosisInput>({
    annual_income: 4500000,
    age: 30,
    employment_type: "employee",
    family_type: "single",
    has_dependent: false,
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await diagnose(form)
      setResult(res)
      setStep("result")
    } catch {
      alert("診断に失敗しました。もう一度お試しください。")
    } finally {
      setLoading(false)
    }
  }

  if (step === "result" && result) {
    return (
      <div className="space-y-6">
        <Card className="bg-emerald-50 border-emerald-200">
          <p className="text-sm text-emerald-700 font-medium">あなたの節税ポテンシャル</p>
          <p className="text-4xl font-bold text-emerald-600 mt-1">
            年間 ¥{fmt(result.total_saving)}
          </p>
          <p className="text-sm text-emerald-600 mt-1">を節税できる可能性があります</p>
        </Card>

        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-700">節税ランキング（インパクト順）</h2>
          {result.tasks.map((t, i) => (
            <Card key={t.task_type} className="flex items-start gap-4">
              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center">
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800">{t.title}</p>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{t.description}</p>
              </div>
              <p className="flex-shrink-0 text-sm font-bold text-emerald-600">¥{fmt(t.estimated_saving)}</p>
            </Card>
          ))}
        </div>

        <div className="flex gap-3">
          <Button onClick={() => router.push("/tasks")} className="flex-1">
            タスクを確認する →
          </Button>
          <Button variant="secondary" onClick={() => setStep("form")}>
            再診断
          </Button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <h2 className="text-sm font-semibold text-gray-700 mb-4">年収を選択</h2>
        <div className="grid grid-cols-2 gap-2">
          {INCOME_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setForm((f) => ({ ...f, annual_income: opt.value }))}
              className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                form.annual_income === opt.value
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                  : "border-gray-200 text-gray-600 hover:border-emerald-300"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="text-sm font-semibold text-gray-700 mb-4">雇用形態</h2>
        <div className="flex gap-2">
          {(["employee", "part_time", "self_employed"] as const).map((e) => {
            const labels = { employee: "会社員", part_time: "パート・アルバイト", self_employed: "自営業" }
            return (
              <button
                key={e}
                type="button"
                onClick={() => setForm((f) => ({ ...f, employment_type: e }))}
                className={`flex-1 rounded-lg border px-2 py-2 text-xs font-medium transition-colors ${
                  form.employment_type === e
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                    : "border-gray-200 text-gray-600 hover:border-emerald-300"
                }`}
              >
                {labels[e]}
              </button>
            )
          })}
        </div>
      </Card>

      <Card>
        <h2 className="text-sm font-semibold text-gray-700 mb-4">家族構成</h2>
        <div className="flex gap-2 mb-4">
          {(["single", "couple", "family_with_child"] as const).map((f) => {
            const labels = { single: "独身", couple: "夫婦", family_with_child: "子あり" }
            return (
              <button
                key={f}
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, family_type: f }))}
                className={`flex-1 rounded-lg border px-2 py-2 text-xs font-medium transition-colors ${
                  form.family_type === f
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                    : "border-gray-200 text-gray-600 hover:border-emerald-300"
                }`}
              >
                {labels[f]}
              </button>
            )
          })}
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={form.has_dependent}
            onChange={(e) => setForm((f) => ({ ...f, has_dependent: e.target.checked }))}
            className="rounded border-gray-300 text-emerald-600"
          />
          扶養家族がいる
        </label>
      </Card>

      <Button type="submit" loading={loading} className="w-full py-3 text-base">
        節税診断する（無料）
      </Button>
    </form>
  )
}

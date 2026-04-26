"use client"

import { useState } from "react"
import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"

interface Analysis {
  total: number
  byCategory: { category: string; label: string; amount: number; ratio: number }[]
  suggestions: { category: string; amount: number; tip: string; saving: number }[]
  totalPotentialSaving: number
}

function fmt(n: number) {
  return n.toLocaleString("ja-JP")
}

export default function ExpensesPage() {
  const [loading, setLoading] = useState(false)
  const [analysis, setAnalysis] = useState<Analysis | null>(null)
  const [error, setError] = useState("")

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setLoading(true)
    setError("")
    const form = new FormData()
    form.append("file", file)
    const res = await fetch("/api/expenses", { method: "POST", body: form })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setError(data.error); return }
    setAnalysis(data)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">支出分析</h1>
        <p className="mt-1 text-sm text-gray-500">クレカ明細をCSVでアップロードして削減余地を見つけよう</p>
      </div>

      <Card>
        <h2 className="text-sm font-semibold text-gray-700 mb-3">CSVをアップロード</h2>
        <p className="text-xs text-gray-400 mb-3">形式：日付,説明,金額（1行目はヘッダー）</p>
        <label className="block w-full cursor-pointer rounded-lg border-2 border-dashed border-gray-200 p-8 text-center hover:border-emerald-300 transition-colors">
          <input type="file" accept=".csv" className="hidden" onChange={handleUpload} />
          <p className="text-sm text-gray-500">{loading ? "解析中..." : "クリックまたはドラッグでCSVをアップロード"}</p>
          <p className="text-xs text-gray-400 mt-1">楽天カード・三井住友・イオンカードなど主要カードに対応</p>
        </label>
        {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
      </Card>

      {analysis && (
        <>
          {analysis.totalPotentialSaving > 0 && (
            <Card className="bg-emerald-50 border-emerald-200">
              <p className="text-sm text-emerald-700 font-medium">削減できる可能性</p>
              <p className="text-3xl font-bold text-emerald-600 mt-1">月 ¥{fmt(analysis.totalPotentialSaving)}</p>
              <p className="text-xs text-emerald-500 mt-1">年換算 ¥{fmt(analysis.totalPotentialSaving * 12)}</p>
            </Card>
          )}

          <Card>
            <h2 className="text-sm font-semibold text-gray-700 mb-4">支出内訳 合計¥{fmt(analysis.total)}</h2>
            <div className="space-y-3">
              {analysis.byCategory.map((c) => (
                <div key={c.category}>
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>{c.label}</span>
                    <span>¥{fmt(c.amount)} ({c.ratio}%)</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div className="h-full rounded-full bg-emerald-400" style={{ width: `${c.ratio}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {analysis.suggestions.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-gray-700">削減提案</h2>
              {analysis.suggestions.map((s, i) => (
                <Card key={i}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{s.category} 削減</p>
                      <p className="text-xs text-gray-500 mt-1">{s.tip}</p>
                    </div>
                    <p className="text-sm font-bold text-emerald-600 flex-shrink-0">月-¥{fmt(s.saving)}</p>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      <Card className="bg-gray-50">
        <p className="text-xs font-semibold text-gray-600 mb-2">CSVサンプル</p>
        <pre className="text-xs text-gray-500 font-mono whitespace-pre-wrap">
{`日付,説明,金額
2024-01-15,スーパーマーケット,3500
2024-01-16,Netflix,1490
2024-01-17,電車代,340`}
        </pre>
      </Card>
    </div>
  )
}

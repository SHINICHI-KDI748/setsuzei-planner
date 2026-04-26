"use client"

import { useState } from "react"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { useRouter } from "next/navigation"

export default function UpgradePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleCheckout() {
    setLoading(true)
    const res = await fetch("/api/stripe/checkout", { method: "POST" })
    const { url, error } = await res.json()
    if (error) {
      alert(error)
      setLoading(false)
      return
    }
    router.push(url)
  }

  return (
    <div className="space-y-8 max-w-md mx-auto">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">プレミアムにアップグレード</h1>
        <p className="mt-2 text-sm text-gray-500">節税効果を最大化しよう</p>
      </div>

      <Card className="border-emerald-200 bg-emerald-50">
        <div className="text-center mb-6">
          <p className="text-sm font-medium text-emerald-700">節税プランナー プレミアム</p>
          <p className="text-4xl font-bold text-gray-900 mt-2">
            ¥980<span className="text-base font-normal text-gray-500">/月</span>
          </p>
          <p className="text-xs text-emerald-600 mt-1">節税額の平均は年5万円以上。月980円で元が取れる</p>
        </div>

        <ul className="space-y-3 mb-6">
          {[
            "節税診断（無制限）",
            "タスク管理・進捗トラッキング",
            "節税額の成果レポート",
            "メールサポート",
          ].map((f) => (
            <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
              <svg className="h-4 w-4 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              {f}
            </li>
          ))}
        </ul>

        <Button onClick={handleCheckout} loading={loading} className="w-full py-3">
          今すぐ始める →
        </Button>
        <p className="text-center text-xs text-gray-400 mt-3">いつでも解約可能。返金保証なし。</p>
      </Card>
    </div>
  )
}

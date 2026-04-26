import { Card } from "@/components/ui/Card"
import Link from "next/link"

interface Props {
  totalSaving: number
  actualSaving: number
  completedTasks: number
  totalTasks: number
  isPremium: boolean
}

function fmt(n: number) {
  return n.toLocaleString("ja-JP")
}

export function SavingReport({ totalSaving, actualSaving, completedTasks, totalTasks, isPremium }: Props) {
  const remaining = totalSaving - actualSaving
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
  const monthlyEquivalent = Math.round(actualSaving / 12)

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold text-gray-700">節税成果レポート</h2>

      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-emerald-50 border-emerald-100">
          <p className="text-xs text-emerald-600 font-medium">実行済み節税額</p>
          <p className="text-2xl font-bold text-emerald-700 mt-1">¥{fmt(actualSaving)}</p>
          <p className="text-xs text-emerald-500 mt-0.5">月換算 ¥{fmt(monthlyEquivalent)}</p>
        </Card>
        <Card>
          <p className="text-xs text-gray-500 font-medium">未実行の節税余地</p>
          <p className="text-2xl font-bold text-amber-500 mt-1">¥{fmt(remaining)}</p>
          <p className="text-xs text-gray-400 mt-0.5">あと{totalTasks - completedTasks}タスク</p>
        </Card>
      </div>

      <Card>
        <div className="flex justify-between items-center mb-2">
          <p className="text-xs font-semibold text-gray-600">実行進捗 {completedTasks}/{totalTasks}</p>
          <p className="text-xs font-bold text-emerald-600">{progress}%</p>
        </div>
        <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>
        {progress < 100 && (
          <p className="text-xs text-gray-400 mt-2">
            全タスク完了で年間 ¥{fmt(totalSaving)} の節税達成
          </p>
        )}
      </Card>

      {!isPremium && actualSaving > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <p className="text-sm font-semibold text-amber-800 mb-1">さらに節税を最大化する</p>
          <p className="text-xs text-amber-700 mb-3">
            プレミアムで詳細レポートと専用サポートを利用できます。月980円で年{fmt(totalSaving)}円の節税を確実に。
          </p>
          <Link href="/upgrade" className="text-xs font-semibold text-amber-700 hover:underline">
            アップグレードする →
          </Link>
        </Card>
      )}
    </div>
  )
}

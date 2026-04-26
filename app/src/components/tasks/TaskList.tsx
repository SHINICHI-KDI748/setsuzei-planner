"use client"

import { useState } from "react"
import { Card } from "@/components/ui/Card"
import { toggleTask } from "@/lib/api"
import type { TaxTask } from "@/types"

function fmt(n: number) {
  return n.toLocaleString("ja-JP")
}

export function TaskList({ initialTasks }: { initialTasks: TaxTask[] }) {
  const [tasks, setTasks] = useState(initialTasks)

  async function handleToggle(task: TaxTask) {
    const optimistic = tasks.map((t) =>
      t.id === task.id ? { ...t, is_completed: !t.is_completed } : t
    )
    setTasks(optimistic)
    try {
      await toggleTask(task.id, !task.is_completed)
    } catch {
      setTasks(tasks)
    }
  }

  const pending = tasks.filter((t) => !t.is_completed)
  const completed = tasks.filter((t) => t.is_completed)
  const totalSaving = tasks.reduce((s, t) => s + t.estimated_saving, 0)
  const actualSaving = completed.reduce((s, t) => s + t.estimated_saving, 0)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <p className="text-xs text-gray-500">未実行の節税額</p>
          <p className="text-2xl font-bold text-amber-500 mt-1">¥{fmt(totalSaving - actualSaving)}</p>
        </Card>
        <Card>
          <p className="text-xs text-gray-500">実行済み節税額</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">¥{fmt(actualSaving)}</p>
        </Card>
      </div>

      {pending.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-700">未実行 ({pending.length})</h2>
          {pending.map((task) => (
            <TaskCard key={task.id} task={task} onToggle={handleToggle} />
          ))}
        </div>
      )}

      {completed.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-400">完了 ({completed.length})</h2>
          {completed.map((task) => (
            <TaskCard key={task.id} task={task} onToggle={handleToggle} />
          ))}
        </div>
      )}
    </div>
  )
}

function TaskCard({ task, onToggle }: { task: TaxTask; onToggle: (t: TaxTask) => void }) {
  const steps = task.action_steps ?? []
  return (
    <Card className={`transition-opacity ${task.is_completed ? "opacity-60" : ""}`}>
      <div className="flex items-start gap-3">
        <button
          onClick={() => onToggle(task)}
          className={`flex-shrink-0 mt-0.5 h-5 w-5 rounded border-2 flex items-center justify-center transition-colors ${
            task.is_completed
              ? "border-emerald-500 bg-emerald-500"
              : "border-gray-300 hover:border-emerald-400"
          }`}
        >
          {task.is_completed && (
            <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className={`text-sm font-semibold ${task.is_completed ? "line-through text-gray-400" : "text-gray-800"}`}>
              {task.title}
            </p>
            <p className="flex-shrink-0 text-sm font-bold text-emerald-600">
              ¥{fmt(task.estimated_saving)}
            </p>
          </div>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">{task.description}</p>

          {!task.is_completed && steps.length > 0 && (
            <ol className="mt-3 space-y-1.5">
              {steps.map((step, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                  <span className="flex-shrink-0 w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-[10px]">
                    {i + 1}
                  </span>
                  <span className="leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>
          )}

          {task.affiliate_url && !task.is_completed && (
            <a
              href={task.affiliate_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-emerald-600 hover:underline"
            >
              {task.affiliate_label ?? "詳細を確認する →"}
            </a>
          )}
        </div>
      </div>
    </Card>
  )
}

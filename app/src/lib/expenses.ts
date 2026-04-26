export type ExpenseCategory =
  | "food"
  | "transport"
  | "entertainment"
  | "subscription"
  | "insurance"
  | "medical"
  | "education"
  | "other"

export interface ParsedExpense {
  date: string
  description: string
  amount: number
  category: ExpenseCategory
}

const CATEGORY_RULES: { pattern: RegExp; category: ExpenseCategory }[] = [
  { pattern: /スーパー|コンビニ|食料|弁当|飲食|レストラン|カフェ|ランチ|ディナー|マクドナルド|吉野家|すき家/i, category: "food" },
  { pattern: /交通|電車|バス|タクシー|新幹線|航空|ガソリン|駐車/i, category: "transport" },
  { pattern: /映画|ゲーム|音楽|Netflix|Hulu|Amazon Prime|YouTube Premium|娯楽/i, category: "entertainment" },
  { pattern: /月額|サブスク|subscription|定期/i, category: "subscription" },
  { pattern: /保険|insurance/i, category: "insurance" },
  { pattern: /病院|薬局|クリニック|医療|歯科/i, category: "medical" },
  { pattern: /書籍|本|セミナー|講座|スクール|塾|教育/i, category: "education" },
]

export function categorize(description: string): ExpenseCategory {
  for (const { pattern, category } of CATEGORY_RULES) {
    if (pattern.test(description)) return category
  }
  return "other"
}

export function parseCSV(csv: string): ParsedExpense[] {
  const lines = csv.trim().split("\n").filter(Boolean)
  if (lines.length < 2) return []

  const results: ParsedExpense[] = []
  for (const line of lines.slice(1)) {
    const cols = line.split(",").map((c) => c.trim().replace(/^"|"$/g, ""))
    const [date, description, amountStr] = cols
    const amount = parseInt(amountStr?.replace(/[^0-9-]/g, "") ?? "0", 10)
    if (!date || !description || isNaN(amount)) continue
    results.push({ date, description, amount: Math.abs(amount), category: categorize(description) })
  }
  return results
}

const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  food: "食費",
  transport: "交通費",
  entertainment: "娯楽",
  subscription: "サブスク",
  insurance: "保険",
  medical: "医療",
  education: "教育",
  other: "その他",
}

export function analyzeSavings(expenses: ParsedExpense[]) {
  const byCategory = expenses.reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] ?? 0) + e.amount
    return acc
  }, {})

  const total = Object.values(byCategory).reduce((s, v) => s + v, 0)

  const suggestions = [
    byCategory["subscription"] > 3000 && {
      category: "サブスク",
      amount: byCategory["subscription"],
      tip: "不要なサブスクを解約するだけで月数千円削減できます",
      saving: Math.round(byCategory["subscription"] * 0.3),
    },
    byCategory["entertainment"] > 10000 && {
      category: "娯楽",
      amount: byCategory["entertainment"],
      tip: "娯楽費を20%削減すると年間で大きな差が出ます",
      saving: Math.round(byCategory["entertainment"] * 0.2),
    },
    byCategory["food"] > 50000 && {
      category: "食費",
      amount: byCategory["food"],
      tip: "食費の10%削減で月5,000円以上の節約になります",
      saving: Math.round(byCategory["food"] * 0.1),
    },
  ].filter(Boolean) as { category: string; amount: number; tip: string; saving: number }[]

  return {
    total,
    byCategory: Object.entries(byCategory).map(([key, value]) => ({
      category: key as ExpenseCategory,
      label: CATEGORY_LABELS[key as ExpenseCategory],
      amount: value,
      ratio: Math.round((value / total) * 100),
    })).sort((a, b) => b.amount - a.amount),
    suggestions,
    totalPotentialSaving: suggestions.reduce((s, sg) => s + sg.saving, 0),
  }
}

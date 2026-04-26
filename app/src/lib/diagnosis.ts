import type { DiagnosisInput, DiagnosisResult } from "@/types"

interface TaskTemplate {
  task_type: string
  title: string
  description: string
  priority: number
  affiliate_url: string | null
  calcSaving: (input: DiagnosisInput) => number
  isApplicable: (input: DiagnosisInput) => boolean
}

const TASK_TEMPLATES: TaskTemplate[] = [
  {
    task_type: "ideco",
    title: "iDeCo（個人型確定拠出年金）に加入する",
    description:
      "毎月の掛金が全額所得控除。年収500万・月2.3万円拠出で年間約4.6万円の節税効果。",
    priority: 1,
    affiliate_url: "https://www.sbi-securities.co.jp/ideco/",
    isApplicable: (i) => i.employment_type === "employee" && i.annual_income >= 3000000,
    calcSaving: (i) => {
      const monthlyMax = 23000
      const taxRate = i.annual_income < 6950000 ? 0.2 : 0.3
      return Math.round(monthlyMax * 12 * taxRate)
    },
  },
  {
    task_type: "furusato",
    title: "ふるさと納税を上限まで活用する",
    description: "2000円の自己負担で返礼品がもらえ、実質的な節税になる。",
    priority: 2,
    affiliate_url: "https://event.rakuten.co.jp/furusato/",
    isApplicable: () => true,
    calcSaving: (i) => {
      // 簡易上限計算（独身・扶養なし基準）
      const base = Math.round((i.annual_income * 0.003 + 2000) * 2)
      return Math.max(base - 2000, 0)
    },
  },
  {
    task_type: "nisa",
    title: "新NISAの非課税枠を活用する",
    description: "年間360万円まで非課税で投資可能。運用益・配当に税金がかからない。",
    priority: 3,
    affiliate_url: "https://www.sbi-securities.co.jp/nisa/",
    isApplicable: (i) => i.annual_income >= 2000000,
    calcSaving: (i) => {
      // 年間投資10万円・利回り5%想定での税節約
      const investAmount = Math.min(i.annual_income * 0.05, 600000)
      return Math.round(investAmount * 0.05 * 0.2)
    },
  },
  {
    task_type: "medical",
    title: "医療費控除を申請する",
    description:
      "年間10万円超の医療費で控除が受けられる。家族合算OK。セルフメディケーション税制も選択可。",
    priority: 4,
    affiliate_url: null,
    isApplicable: () => true,
    calcSaving: (i) => {
      const taxRate = i.annual_income < 6950000 ? 0.1 : 0.2
      return Math.round(50000 * taxRate)
    },
  },
  {
    task_type: "dependent",
    title: "扶養控除・配偶者控除を確認する",
    description: "扶養家族がいる場合、最大38万円の所得控除が受けられる。",
    priority: 1,
    affiliate_url: null,
    isApplicable: (i) => i.has_dependent || i.family_type !== "single",
    calcSaving: (i) => {
      const taxRate = i.annual_income < 6950000 ? 0.2 : 0.3
      return Math.round(380000 * taxRate)
    },
  },
  {
    task_type: "life_insurance",
    title: "生命保険料控除を申請する",
    description: "年末調整・確定申告で最大12万円の所得控除が受けられる。",
    priority: 5,
    affiliate_url: null,
    isApplicable: () => true,
    calcSaving: (i) => {
      const taxRate = i.annual_income < 6950000 ? 0.1 : 0.2
      return Math.round(120000 * taxRate)
    },
  },
]

export function runDiagnosis(input: DiagnosisInput): DiagnosisResult {
  const applicableTasks = TASK_TEMPLATES.filter((t) => t.isApplicable(input))
    .map((t) => ({
      task_type: t.task_type,
      title: t.title,
      description: t.description,
      estimated_saving: t.calcSaving(input),
      priority: t.priority,
      affiliate_url: t.affiliate_url,
    }))
    .sort((a, b) => b.estimated_saving - a.estimated_saving)

  const total_saving = applicableTasks.reduce((sum, t) => sum + t.estimated_saving, 0)

  return { total_saving, tasks: applicableTasks }
}

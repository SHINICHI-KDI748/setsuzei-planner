import type { DiagnosisInput, DiagnosisResult } from "@/types"

interface TaskTemplate {
  task_type: string
  title: string
  description: string
  action_steps: string[]
  priority: number
  affiliate_url: string | null
  affiliate_label: string | null
  calcSaving: (input: DiagnosisInput) => number
  isApplicable: (input: DiagnosisInput) => boolean
}

const TASK_TEMPLATES: TaskTemplate[] = [
  {
    task_type: "ideco",
    title: "iDeCo（個人型確定拠出年金）に加入する",
    description: "毎月の掛金が全額所得控除。年収500万・月2.3万円拠出で年間約5.5万円の節税効果。",
    action_steps: [
      "証券会社でiDeCo口座を開設（SBI証券・楽天証券が手数料無料でおすすめ）",
      "勤務先に「事業主証明書」の記入を依頼",
      "掛金を設定して積立開始（会社員の上限は月2.3万円）",
    ],
    priority: 1,
    affiliate_url: "https://www.ideco-koushiki.jp/join/",
    affiliate_label: "iDeCo公式サイトで加入手続きを確認 →",
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
    description: "2,000円の自己負担で返礼品がもらえ、残額が翌年の税金から控除される。",
    action_steps: [
      "ふるさとチョイスや楽天ふるさと納税で寄付先を選ぶ",
      "ワンストップ特例申請書を自治体に郵送（確定申告不要になる）",
      "翌年の住民税が自動で控除される",
    ],
    priority: 2,
    affiliate_url: "https://www.furusato-tax.jp/",
    affiliate_label: "ふるさとチョイスで寄付先を探す →",
    isApplicable: () => true,
    calcSaving: (i) => {
      const base = Math.round((i.annual_income * 0.003 + 2000) * 2)
      return Math.max(base - 2000, 0)
    },
  },
  {
    task_type: "nisa",
    title: "新NISAの非課税枠を活用する",
    description: "年間360万円まで非課税で投資可能。運用益・配当に税金がかからない。",
    action_steps: [
      "証券会社でNISA口座を開設（1人1口座のみ）",
      "つみたて投資枠で月3〜5万円からインデックスファンドを積立開始",
      "成長投資枠で個別株やETFへの投資も可能",
    ],
    priority: 3,
    affiliate_url: "https://www.rakuten-sec.co.jp/nisa/",
    affiliate_label: "楽天証券でNISA口座を開設 →",
    isApplicable: (i) => i.annual_income >= 2000000,
    calcSaving: (i) => {
      const investAmount = Math.min(i.annual_income * 0.05, 600000)
      return Math.round(investAmount * 0.05 * 0.2)
    },
  },
  {
    task_type: "medical",
    title: "医療費控除を申請する",
    description: "年間10万円超の医療費で控除が受けられる。家族分を合算してOK。",
    action_steps: [
      "1年間（1〜12月）の医療費の領収書・明細書を集める",
      "国税庁の確定申告書作成コーナーで申告書を作成",
      "e-Tax（オンライン）または税務署への郵送で提出",
    ],
    priority: 4,
    affiliate_url: "https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/1120.htm",
    affiliate_label: "国税庁：医療費控除の詳細を確認 →",
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
    action_steps: [
      "年末調整の「扶養控除等申告書」に家族の情報を正確に記入",
      "配偶者の年収が150万円以下なら配偶者特別控除も対象",
      "16歳以上の子どもがいれば扶養控除（38万円）が適用される",
    ],
    priority: 1,
    affiliate_url: "https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/1180.htm",
    affiliate_label: "国税庁：扶養控除の詳細を確認 →",
    isApplicable: (i) => i.has_dependent || i.family_type !== "single",
    calcSaving: (i) => {
      const taxRate = i.annual_income < 6950000 ? 0.2 : 0.3
      return Math.round(380000 * taxRate)
    },
  },
  {
    task_type: "life_insurance",
    title: "生命保険料控除を申請する",
    description: "生命保険・医療保険・個人年金に加入していれば、年末調整で最大12万円の所得控除が受けられる。",
    action_steps: [
      "保険会社から毎年10〜11月に届く「生命保険料控除証明書」を用意する",
      "会社の年末調整で「保険料控除申告書」に金額を記入して提出",
      "証明書を紛失した場合は保険会社に再発行を依頼（無料）",
    ],
    priority: 5,
    affiliate_url: "https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/1140.htm",
    affiliate_label: "国税庁：生命保険料控除の詳細を確認 →",
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
      action_steps: t.action_steps,
      estimated_saving: t.calcSaving(input),
      priority: t.priority,
      affiliate_url: t.affiliate_url,
      affiliate_label: t.affiliate_label,
    }))
    .sort((a, b) => b.estimated_saving - a.estimated_saving)

  const total_saving = applicableTasks.reduce((sum, t) => sum + t.estimated_saving, 0)

  return { total_saving, tasks: applicableTasks }
}

import { DiagnosisForm } from "@/components/diagnosis/DiagnosisForm"

export default function DiagnosisPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">節税診断</h1>
        <p className="mt-1 text-sm text-gray-500">2分で完了。あなたに最適な節税プランを自動生成します。</p>
      </div>
      <DiagnosisForm />
    </div>
  )
}

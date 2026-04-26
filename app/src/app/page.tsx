import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      <header className="mx-auto max-w-3xl px-6 py-5 flex justify-between items-center">
        <span className="text-xl font-bold text-emerald-600">節税プランナー</span>
        <Link href="/login" className="text-sm text-gray-500 hover:text-emerald-600 transition-colors">ログイン</Link>
      </header>

      <main className="mx-auto max-w-3xl px-6 pt-16 pb-24 text-center">
        <p className="inline-block text-xs font-semibold bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full mb-6">
          年収400〜700万円の会社員向け
        </p>
        <h1 className="text-4xl font-bold text-gray-900 leading-tight mb-6">
          知らないだけで
          <br />
          <span className="text-emerald-600">年5万円以上</span>損してるかもしれません
        </h1>
        <p className="text-gray-500 text-lg mb-10">
          2分の診断で、あなたに最適な節税プランを自動生成。
          <br />
          「今すぐやること」だけをタスクにまとめます。
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-16">
          <Link
            href="/diagnosis"
            className="inline-flex items-center justify-center rounded-xl bg-emerald-600 text-white font-semibold px-8 py-4 text-base hover:bg-emerald-700 transition-colors"
          >
            無料で診断する →
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-xl border border-gray-300 text-gray-700 font-semibold px-8 py-4 text-base hover:bg-gray-50 transition-colors"
          >
            ログインして保存する
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-6 text-center">
          {[
            { num: "平均", value: "¥52,000", label: "年間節税見込み額" },
            { num: "2分", value: "で完了", label: "診断所要時間" },
            { num: "6種類", value: "の節税術", label: "を自動チェック" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <p className="text-xs text-gray-400 mb-1">{s.num}</p>
              <p className="text-xl font-bold text-gray-800">{s.value}</p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

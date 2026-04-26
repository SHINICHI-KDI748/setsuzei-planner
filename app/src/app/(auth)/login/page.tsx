import { LoginForm } from "@/components/ui/LoginForm"
import Link from "next/link"

export default function LoginPage() {
  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-8">
        <Link href="/" className="text-2xl font-bold text-emerald-600">節税プランナー</Link>
        <p className="mt-2 text-sm text-gray-500">ログインして節税プランを保存・管理する</p>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <LoginForm />
      </div>
      <p className="text-center mt-6 text-xs text-gray-400">
        ログイン不要でも
        <Link href="/diagnosis" className="text-emerald-600 hover:underline ml-1">診断だけ試せます →</Link>
      </p>
    </div>
  )
}

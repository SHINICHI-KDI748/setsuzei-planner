"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Button } from "./Button"

type Mode = "login" | "signup" | "reset"

export function LoginForm() {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")
    setMessage("")
    const supabase = createClient()

    if (mode === "reset") {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${location.origin}/auth/callback?next=/update-password`,
      })
      setLoading(false)
      if (error) { setError(error.message); return }
      setMessage("パスワードリセットメールを送りました")
      return
    }

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) { setError(error.message); setLoading(false); return }
      const { error: loginError } = await supabase.auth.signInWithPassword({ email, password })
      if (loginError) { setError("登録完了。ログインしてください。"); setMode("login"); setLoading(false); return }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) { setError("メールアドレスまたはパスワードが違います"); setLoading(false); return }
    }

    router.push("/dashboard")
    router.refresh()
  }

  if (mode === "reset") {
    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">メールアドレス</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
        {message && <p className="text-xs text-emerald-600">{message}</p>}
        <Button type="submit" loading={loading} className="w-full py-3">
          リセットメールを送る
        </Button>
        <button
          type="button"
          onClick={() => { setMode("login"); setError(""); setMessage("") }}
          className="w-full text-center text-xs text-gray-400 hover:text-emerald-600 transition-colors"
        >
          ← ログインに戻る
        </button>
      </form>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">メールアドレス</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />
      </div>
      <div>
        <div className="flex justify-between items-center mb-1">
          <label className="block text-sm font-medium text-gray-700">パスワード</label>
          {mode === "login" && (
            <button
              type="button"
              onClick={() => { setMode("reset"); setError("") }}
              className="text-xs text-emerald-600 hover:underline"
            >
              パスワードを忘れた
            </button>
          )}
        </div>
        <input
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="6文字以上"
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
      <Button type="submit" loading={loading} className="w-full py-3">
        {mode === "login" ? "ログイン" : "新規登録"}
      </Button>
      <button
        type="button"
        onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError("") }}
        className="w-full text-center text-xs text-gray-400 hover:text-emerald-600 transition-colors"
      >
        {mode === "login" ? "アカウントを作成する →" : "ログインはこちら →"}
      </button>
    </form>
  )
}

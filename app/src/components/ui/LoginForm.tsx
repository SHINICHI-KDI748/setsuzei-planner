"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "./Button"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}/auth/callback` },
    })
    setLoading(false)
    if (error) {
      setError(error.message)
    } else {
      setSent(true)
    }
  }

  if (sent) {
    return (
      <div className="text-center">
        <p className="text-4xl mb-3">📧</p>
        <h2 className="text-lg font-semibold text-gray-800 mb-2">メールを確認してください</h2>
        <p className="text-sm text-gray-500">{email} にログインリンクを送りました</p>
      </div>
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
      {error && <p className="text-xs text-red-500">{error}</p>}
      <Button type="submit" loading={loading} className="w-full py-3">
        ログインリンクを送る
      </Button>
      <p className="text-center text-xs text-gray-400">パスワード不要。メールのリンクをクリックするだけ。</p>
    </form>
  )
}

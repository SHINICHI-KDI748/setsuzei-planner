import { AppNav } from "@/components/layout/AppNav"
import type { ReactNode } from "react"

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <AppNav />
      <main className="mx-auto max-w-3xl px-4 py-8">{children}</main>
    </div>
  )
}

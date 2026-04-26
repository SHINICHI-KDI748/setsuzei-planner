import Stripe from "stripe"

let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2026-04-22.dahlia",
    })
  }
  return _stripe
}

export const PLANS = {
  monthly: {
    priceId: process.env.STRIPE_PRICE_ID_MONTHLY ?? "",
    name: "節税プランナー プレミアム",
    price: 980,
    interval: "month" as const,
    features: [
      "節税診断（無制限）",
      "タスク管理・進捗トラッキング",
      "節税額の成果レポート",
      "専用サポート",
    ],
  },
}

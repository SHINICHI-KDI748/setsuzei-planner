#!/usr/bin/env npx tsx
/**
 * X投稿テキスト自動生成スクリプト
 * 使用: npx tsx scripts/generate_x_post.ts [--post]
 * --post フラグを付けると実際にAPIへ投稿する
 */

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://your-app.vercel.app"

const THEMES = [
  {
    tag: "iDeCo",
    generate: () => `iDeCoを月2.3万円積み立てると年間約55,200円の節税になります。\n\n会社員の加入率はまだ10%以下。知っているかどうかだけの差です。\n\n→ あなたの節税額を診断 ${APP_URL}\n\n#節税 #iDeCo #資産形成`,
  },
  {
    tag: "ふるさと納税",
    generate: () => {
      const incomes = [300, 400, 500, 600, 700]
      const limits = [27000, 42000, 61000, 77000, 108000]
      const lines = incomes.map((y, i) => `年収${y}万 → 上限¥${limits[i].toLocaleString()}`).join("\n")
      return `ふるさと納税の上限額（独身・目安）：\n\n${lines}\n\n2,000円の自己負担で全額返礼品に変換できます。\n\n→ 診断してみる ${APP_URL}\n\n#ふるさと納税 #節税`
    },
  },
  {
    tag: "損失訴求",
    generate: () => `年収500万の会社員が何も対策しないと毎年5万円以上を余計に払っています。\n\niDeCo・ふるさと納税・保険料控除の3つだけで回避できます。\n\n難しくない。知っているかどうかだけ。\n\n→ 2分で診断 ${APP_URL}\n\n#節税 #会社員`,
  },
  {
    tag: "NISA",
    generate: () => `新NISAと節税の違い：\n\n節税 → 今の税金を減らす（即効性◎）\nNISA → 将来の税金を減らす（長期効果◎）\n\n両方やるのが正解。でも「節税」を知らない人が多い。\n\n→ 節税診断（無料）${APP_URL}\n\n#節税 #NISA #資産形成`,
  },
  {
    tag: "行動促進",
    generate: () => `「節税しよう」と思ってから1年後も何もしていない人へ：\n\n✅ iDeCo → 証券口座で申込20分\n✅ ふるさと納税 → ネット購入15分\n✅ 保険料控除 → 年末調整5分\n\n難しいのは最初だけ。今年こそやりましょう。\n\n→ ${APP_URL}\n\n#節税`,
  },
]

function pickTheme(date: Date) {
  const idx = date.getDate() % THEMES.length
  return THEMES[idx]
}

async function postToX(text: string) {
  const {
    X_API_KEY,
    X_API_SECRET,
    X_ACCESS_TOKEN,
    X_ACCESS_SECRET,
  } = process.env

  if (!X_API_KEY || !X_API_SECRET || !X_ACCESS_TOKEN || !X_ACCESS_SECRET) {
    console.error("X API の環境変数が設定されていません")
    process.exit(1)
  }

  // Node.js crypto で OAuth 1.0a 署名
  const crypto = await import("crypto")
  const timestamp = Math.floor(Date.now() / 1000).toString()
  const nonce = crypto.randomBytes(16).toString("hex")
  const endpoint = "https://api.twitter.com/2/tweets"

  const oauthParams = {
    oauth_consumer_key: X_API_KEY,
    oauth_nonce: nonce,
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: timestamp,
    oauth_token: X_ACCESS_TOKEN,
    oauth_version: "1.0",
  }

  const sortedParams = Object.entries(oauthParams)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join("&")

  const baseString = [
    "POST",
    encodeURIComponent(endpoint),
    encodeURIComponent(sortedParams),
  ].join("&")

  const signingKey = `${encodeURIComponent(X_API_SECRET)}&${encodeURIComponent(X_ACCESS_SECRET)}`
  const signature = crypto
    .createHmac("sha1", signingKey)
    .update(baseString)
    .digest("base64")

  const authHeader =
    "OAuth " +
    Object.entries({ ...oauthParams, oauth_signature: signature })
      .map(([k, v]) => `${encodeURIComponent(k)}="${encodeURIComponent(v)}"`)
      .join(", ")

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: authHeader,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  })

  const data = await res.json()
  if (res.status === 201) {
    console.log("投稿成功:", data.data.id)
  } else {
    console.error("投稿失敗:", JSON.stringify(data))
    process.exit(1)
  }
}

const shouldPost = process.argv.includes("--post")
const theme = pickTheme(new Date())
const text = theme.generate()

console.log(`[テーマ: ${theme.tag}]\n`)
console.log(text)
console.log(`\n文字数: ${text.length}`)

if (shouldPost) {
  await postToX(text)
}

#!/bin/bash
# X (Twitter) 投稿スクリプト
# 使用方法: ./scripts/post_to_x.sh "投稿テキスト"
# 事前に .env に X_BEARER_TOKEN, X_API_KEY, X_API_SECRET,
#         X_ACCESS_TOKEN, X_ACCESS_SECRET を設定すること

set -euo pipefail

if [ -z "${1:-}" ]; then
  echo "Usage: $0 \"投稿テキスト\"" >&2
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ENV_FILE="$SCRIPT_DIR/../.env"

if [ -f "$ENV_FILE" ]; then
  # shellcheck disable=SC1090
  source "$ENV_FILE"
fi

: "${X_API_KEY:?X_API_KEY が未設定}"
: "${X_API_SECRET:?X_API_SECRET が未設定}"
: "${X_ACCESS_TOKEN:?X_ACCESS_TOKEN が未設定}"
: "${X_ACCESS_SECRET:?X_ACCESS_SECRET が未設定}"

TEXT="$1"
TIMESTAMP=$(date -u +%s)
NONCE=$(openssl rand -hex 16)

ENDPOINT="https://api.twitter.com/2/tweets"

# OAuth 1.0a 署名（curl + openssl による実装）
oauth_sign() {
  local method="$1" url="$2" params="$3"
  local base_string="${method}&$(python3 -c "import urllib.parse,sys; print(urllib.parse.quote(sys.argv[1], safe=''))" "$url")&$(python3 -c "import urllib.parse,sys; print(urllib.parse.quote(sys.argv[1], safe=''))" "$params")"
  local signing_key="$(python3 -c "import urllib.parse,sys; print(urllib.parse.quote(sys.argv[1], safe=''))" "$X_API_SECRET")&$(python3 -c "import urllib.parse,sys; print(urllib.parse.quote(sys.argv[1], safe=''))" "$X_ACCESS_SECRET")"
  echo -n "$base_string" | openssl dgst -sha1 -hmac "$signing_key" -binary | base64
}

OAUTH_PARAMS="oauth_consumer_key=${X_API_KEY}&oauth_nonce=${NONCE}&oauth_signature_method=HMAC-SHA1&oauth_timestamp=${TIMESTAMP}&oauth_token=${X_ACCESS_TOKEN}&oauth_version=1.0"
SIG=$(oauth_sign "POST" "$ENDPOINT" "$OAUTH_PARAMS")
SIG_ENC=$(python3 -c "import urllib.parse,sys; print(urllib.parse.quote(sys.argv[1], safe=''))" "$SIG")

AUTH_HEADER="OAuth oauth_consumer_key=\"${X_API_KEY}\", oauth_nonce=\"${NONCE}\", oauth_signature=\"${SIG_ENC}\", oauth_signature_method=\"HMAC-SHA1\", oauth_timestamp=\"${TIMESTAMP}\", oauth_token=\"${X_ACCESS_TOKEN}\", oauth_version=\"1.0\""

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$ENDPOINT" \
  -H "Authorization: $AUTH_HEADER" \
  -H "Content-Type: application/json" \
  -d "{\"text\": $(python3 -c "import json,sys; print(json.dumps(sys.argv[1]))" "$TEXT")}")

HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | head -1)

if [ "$HTTP_CODE" = "201" ]; then
  echo "投稿成功: $BODY"
else
  echo "投稿失敗 ($HTTP_CODE): $BODY" >&2
  exit 1
fi

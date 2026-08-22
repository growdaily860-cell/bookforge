# bookforge-api — Cloudflare Worker

웹 데모(`web/`)가 쓰는 유일한 백엔드다. 존재 이유는 하나 — **Anthropic API 키를 브라우저와
Vercel 밖에 두는 것**.

```
브라우저  ──POST /api/blueprint──▶  Cloudflare Worker  ──x-api-key──▶  Anthropic API
(키 없음)                          (키는 여기 secret 에만)
```

Vercel에 올라가는 프런트엔드는 이 Worker의 **공개 URL**만 안다. 프런트 번들을 통째로 뜯어봐도
키는 나오지 않는다.

## 배포 — 3단계

사전 준비: [Cloudflare 계정](https://dash.cloudflare.com/sign-up)(무료 플랜으로 충분)과
[Anthropic API 키](https://console.anthropic.com/settings/keys).

```bash
cd workers/bookforge-api
npm install

# 1. Cloudflare 로그인 (브라우저가 열린다)
npx wrangler login

# 2. 키를 Worker secret 으로 넣는다 — 이 값은 저장소에 남지 않는다
npx wrangler secret put ANTHROPIC_API_KEY
#    프롬프트에 sk-ant-... 붙여넣기

# 3. 배포
npx wrangler deploy
#    → https://bookforge-api.<계정서브도메인>.workers.dev
```

배포가 끝나면 출력된 URL을 `web/site.config.ts` 의 `workerUrl` 에 넣고 push 하면 Vercel이
자동으로 재배포되며 데모가 켜진다. (또는 Vercel 프로젝트 환경변수
`NEXT_PUBLIC_BOOKFORGE_API` 에 같은 값을 넣는다.)

동작 확인:

```bash
curl https://bookforge-api.<계정서브도메인>.workers.dev/api/health
# {"ok":true,"configured":true,"model":"claude-opus-5"}
```

## 배포 직후 반드시 할 것 — Origin 좁히기

`wrangler.toml` 의 `ALLOWED_ORIGINS` 는 기본값이 `https://*.vercel.app` 이라 아무 Vercel
프로젝트에서나 호출할 수 있다. 실제 도메인이 정해지면 좁힌다:

```toml
[vars]
ALLOWED_ORIGINS = "https://bookforge-web.vercel.app,https://내도메인.com"
```

그리고 다시 `npx wrangler deploy`.

## 엔드포인트

### `GET /api/health`

```json
{ "ok": true, "configured": true, "model": "claude-opus-5" }
```

### `POST /api/blueprint`

요청:

```json
{ "topic": "온디바이스 AI 2026 동향", "style": "insight" }
```

`topic` 은 120자 이내 필수, `style` 은 선택(`practical` `insight` `academic` `essay`
`business` `magazine` 중 하나, 생략하면 모델이 고른다).

응답:

```json
{
  "title": "…", "subtitle": "…",
  "style": "insight", "styleReason": "…",
  "lengthPreset": "standard", "totalPages": 35,
  "chapters": [{ "no": 1, "title": "…", "summary": "…", "pages": 5 }]
}
```

출력 형식은 Anthropic structured outputs(zod 스키마)로 강제하므로 응답 파싱이 실패할 여지가
없다. 실패 시에는 `{ "error": "…" }` 와 함께 4xx/5xx 를 반환한다.

## 이 Worker가 거는 방어선

| 항목 | 값 | 어디서 바꾸나 |
|---|---|---|
| Origin 화이트리스트 | `ALLOWED_ORIGINS` | `wrangler.toml` `[vars]` |
| 주제 길이 상한 | 120자 | `src/index.ts` `MAX_TOPIC_LEN` |
| 출력 토큰 상한 | 8000 | `src/index.ts` `max_tokens` |
| IP당 분당 요청 | 8회 | `wrangler.toml` `RATE_LIMIT_PER_MIN` |
| 모델 | `claude-opus-5` | `wrangler.toml` `MODEL` |

요청 빈도 제한은 Worker isolate 안의 최선 노력이다. 공개 사이트로 운영한다면 Cloudflare
대시보드 → **Security / WAF → Rate limiting rules** 에서 `/api/*` 에 규칙을 하나 걸어 두는
편이 확실하다. 비용 상한은 Anthropic Console → **Limits** 에서 월 예산으로 따로 거는 것을
권한다.

## 로컬 개발

```bash
cp .dev.vars.example .dev.vars   # 키를 여기에 (gitignore 됨)
npm run dev                      # http://localhost:8787
```

`web/` 을 로컬에서 붙이려면 `web/.env.local` 에:

```
NEXT_PUBLIC_BOOKFORGE_API=http://localhost:8787
```

## 로그

```bash
npx wrangler tail
```

키·주제 원문은 로그에 남기지 않는다. 모델 오류는 상태 코드와 메시지만 기록한다.

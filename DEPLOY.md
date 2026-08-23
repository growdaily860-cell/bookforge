# 배포 안내 — Vercel + Cloudflare

이 저장소는 두 개의 배포 대상을 함께 담고 있다.

| 디렉터리 | 어디에 | 무엇을 | 비밀값 |
|---|---|---|---|
| `web/` | Vercel | 쇼케이스 사이트 + AI 목차 설계 데모 (Next.js) | 없음 |
| `workers/bookforge-api/` | Cloudflare Workers | 데모가 호출하는 API 프록시 | **OpenAI API 키 (여기에만)** |

스킬 본체(`SKILL.md`·`scripts/`·`styles/`)는 배포 대상이 아니다. 로컬 에이전트가 읽고 실행한다.

## 왜 키를 Cloudflare에 두나

Vercel에 올라가는 것은 정적 프런트엔드다. 프런트엔드에 넣은 값은 무엇이든 브라우저에서
읽힌다 — `NEXT_PUBLIC_` 접두사가 붙었든 아니든, 번들에 들어가는 순간 공개다. 그래서 모델
API 키는 프런트엔드가 아니라 별도 서버에 있어야 하고, 그 서버 역할을 Cloudflare Worker가
맡는다.

```
브라우저 ──▶ Vercel (정적 HTML/JS, 키 없음)
   │
   └──POST /api/blueprint──▶ Cloudflare Worker ──Authorization──▶ OpenAI API
                             (wrangler secret 에만 존재)
```

Worker는 키를 쓰기 전에 Origin 화이트리스트, 입력 길이 상한, 출력 토큰 상한, IP당 분당 요청
제한을 통과시킨다. 자세한 값은 `workers/bookforge-api/README.md`.

## 1. Vercel — 사이트

Vercel 프로젝트를 이 저장소에 연결하고 **Root Directory 를 `web`** 으로 지정한다. 나머지는
자동 감지된다(Next.js). 이후 `main` 에 push 할 때마다 재배포된다.

## 2. Cloudflare — 데모 API

```bash
cd workers/bookforge-api
npm install
npx wrangler login                        # 브라우저 인증
npx wrangler secret put OPENAI_API_KEY    # 키 입력 — 저장소에 남지 않는다
npx wrangler deploy                       # → https://bookforge-api.<서브도메인>.workers.dev
```

## 3. 둘을 연결

배포된 Worker URL을 `web/site.config.ts` 의 `workerUrl` 에 넣고 commit·push 한다.

```ts
const workerUrl = "https://bookforge-api.<서브도메인>.workers.dev";
```

Vercel이 재배포되면 데모 패널이 활성화된다. 커밋하고 싶지 않다면 Vercel 프로젝트 설정 →
Environment Variables 에 `NEXT_PUBLIC_BOOKFORGE_API` 로 넣어도 된다(이쪽이 우선한다).

마지막으로 `workers/bookforge-api/wrangler.toml` 의 `ALLOWED_ORIGINS` 를 실제 Vercel
도메인으로 좁히고 다시 `npx wrangler deploy`.

## 현재 배포 (2026-08)

| | 주소 |
|---|---|
| 사이트 | https://bookforge-site-green.vercel.app |
| 데모 API | https://bookforge-api.growdaily860.workers.dev |

## 체크리스트

- [ ] Vercel 프로젝트 Root Directory = `web`
- [ ] `wrangler secret put OPENAI_API_KEY` 완료 (`/api/health` 가 `configured: true`)
- [ ] `web/site.config.ts` 또는 Vercel 환경변수에 Worker URL
- [ ] `ALLOWED_ORIGINS` 를 실제 도메인으로 좁힘
- [ ] OpenAI Platform → Settings → Limits 에서 월 예산 상한 설정

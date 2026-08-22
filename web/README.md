# bookforge web

`bookforge` 스킬의 쇼케이스 사이트 + AI 목차 설계 데모. Next.js(App Router)로 만들었고
Vercel에 배포된다.

```
web/          Vercel (정적 프런트 — 비밀값 없음)
  └─ /api/blueprint 호출 ──▶ workers/bookforge-api (Cloudflare — 여기에만 API 키)
```

## 로컬 실행

```bash
cd web
npm install
npm run dev      # http://localhost:3000
```

데모 패널까지 붙이려면 `workers/bookforge-api` 를 먼저 띄우고(`npm run dev`,
포트 8787) `web/.env.local` 에:

```
NEXT_PUBLIC_BOOKFORGE_API=http://localhost:8787
```

## 배포

Vercel 프로젝트의 **Root Directory 를 `web` 으로** 지정하면 끝이다. 프레임워크는 Next.js로
자동 감지되고, `main` 에 push 할 때마다 재배포된다.

데모 API 주소는 두 곳 중 하나에 넣는다.

1. `web/site.config.ts` 의 `workerUrl` — 커밋되는 값. 팀 전체에 같은 Worker를 쓸 때.
2. Vercel 환경변수 `NEXT_PUBLIC_BOOKFORGE_API` — 이쪽이 우선한다. 미리보기/프로덕션에
   다른 Worker를 붙일 때.

둘 다 비어 있으면 데모 패널이 "미연결" 상태로 안내 문구를 띄운다. 사이트의 나머지 부분은
그대로 동작한다.

## 쇼케이스 이미지

`public/showcase/*.webp` 는 저장소 루트 `examples/showcase/*.png` 를 웹용으로 축소·변환한
것이다. 예시 PDF 원본은 GitHub raw 로 링크한다(`site.config.ts` 의 `rawBase`).
예시를 다시 만들었다면 같은 파일명으로 webp를 갱신하면 된다.

## 비밀값 정책

이 디렉터리에는 어떤 키도 두지 않는다. `NEXT_PUBLIC_*` 는 정의상 브라우저 번들에 실리는
공개 값이므로, 여기에 들어갈 수 있는 것은 Worker의 공개 URL뿐이다.

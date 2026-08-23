/**
 * 사이트 설정 — 비밀값은 여기에 두지 않는다.
 *
 * apiBase 는 Cloudflare Worker 의 공개 주소다. OpenAI API 키는 Worker 의
 * secret 으로만 존재하며, 이 저장소·Vercel 빌드·브라우저 어디에도 실리지 않는다.
 * (workers/bookforge-api/README.md 의 3단계 배포 참고)
 *
 * 배포 후 아래 workerUrl 한 줄을 본인 Worker 주소로 바꿔 push 하면 데모가 켜진다.
 * Vercel 환경변수 NEXT_PUBLIC_BOOKFORGE_API 를 설정하면 그쪽이 우선한다.
 */
const workerUrl = "";

export const siteConfig = {
  name: "bookforge",
  tagline: "주제 한 줄 → 상업도서급 전자책 PDF",
  description:
    "표지·리더선 목차·장 도비라·러닝 헤드·판권면까지 갖춘 한국어 전자책 PDF를 만드는 에이전트 스킬. 6개 스타일 팩, 벡터 도해 트랙, 통과하지 못하면 파일이 존재할 수 없는 QC 게이트.",
  repo: "https://github.com/growdaily860-cell/bookforge",
  upstream: "https://github.com/gongnyang/bookforge",
  rawBase:
    "https://raw.githubusercontent.com/growdaily860-cell/bookforge/main",
  apiBase: (process.env.NEXT_PUBLIC_BOOKFORGE_API || workerUrl).replace(/\/$/, ""),
} as const;

export const demoEnabled = siteConfig.apiBase.length > 0;

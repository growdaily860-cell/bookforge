import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 저장소 루트에도 package-lock.json 이 있으므로(도해 프리렌더 의존성) 추적 루트를
  // 이 디렉터리로 고정한다 — 예시 PDF 24MB 를 빌드 추적에 끌어들이지 않기 위해서다.
  outputFileTracingRoot: here,
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
    ];
  },
};

export default nextConfig;

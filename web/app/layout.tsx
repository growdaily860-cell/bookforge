import type { Metadata, Viewport } from "next";
import { siteConfig } from "@/site.config";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline}`,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
  openGraph: {
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
    type: "website",
    locale: "ko_KR",
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbfaf7" },
    { media: "(prefers-color-scheme: dark)", color: "#131313" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body>
        <header className="site-header">
          <div className="wrap">
            <a className="brand" href="#top">
              bookforge <span>v2</span>
            </a>
            <nav className="nav">
              <a href="#gallery">예시</a>
              <a href="#styles">스타일</a>
              <a className="hide-sm" href="#diagrams">도해</a>
              <a className="hide-sm" href="#gates">게이트</a>
              <a href="#demo">데모</a>
              <a className="ghost" href={siteConfig.repo} target="_blank" rel="noreferrer">
                GitHub
              </a>
            </nav>
          </div>
        </header>
        <main id="top">{children}</main>
        <footer>
          <div className="wrap">
            <span>
              코드·문서 MIT · 동봉 폰트 OFL 1.1 · 예시 PDF 9종은 스킬 데모 산출물
            </span>
            <span className="sep">
              <a href={siteConfig.repo} target="_blank" rel="noreferrer">
                저장소
              </a>
              {" · "}
              <a href={siteConfig.upstream} target="_blank" rel="noreferrer">
                upstream
              </a>
            </span>
          </div>
        </footer>
      </body>
    </html>
  );
}

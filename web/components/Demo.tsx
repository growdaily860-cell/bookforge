"use client";

import { useState } from "react";
import { siteConfig, demoEnabled } from "@/site.config";
import { styles, styleById, type StyleId } from "@/lib/data";

type Chapter = { no: number; title: string; summary: string; pages: number };

type Blueprint = {
  title: string;
  subtitle: string;
  style: StyleId;
  styleReason: string;
  lengthPreset: string;
  totalPages: number;
  chapters: Chapter[];
};

const SAMPLES = [
  "온디바이스 AI 2026 동향",
  "중소기업이 처음 겪는 재고 관리",
  "퇴근길에 쓰는 짧은 에세이",
  "쿠버네티스 없이 버티는 홈 서버",
];

export default function Demo() {
  const [topic, setTopic] = useState("");
  const [style, setStyle] = useState<"auto" | StyleId>("auto");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Blueprint | null>(null);

  async function run(e: React.FormEvent) {
    e.preventDefault();
    const t = topic.trim();
    if (!t || loading) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`${siteConfig.apiBase}/api/blueprint`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ topic: t, style: style === "auto" ? undefined : style }),
      });
      const payload = (await res.json().catch(() => null)) as
        | (Blueprint & { error?: string })
        | null;
      if (!res.ok || !payload) {
        throw new Error(
          payload?.error ||
            (res.status === 429
              ? "요청이 몰렸습니다. 잠시 후 다시 시도해 주세요."
              : `요청 실패 (HTTP ${res.status})`),
        );
      }
      setResult(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류");
    } finally {
      setLoading(false);
    }
  }

  const picked = result ? styleById[result.style] : null;

  return (
    <section id="demo">
      <div className="wrap">
        <div className="section-head">
          <p className="section-kicker">Live demo</p>
          <h2>주제 한 줄로 책의 뼈대를 세워 봅니다</h2>
          <p>
            실제 스킬은 이 단계 다음에 집필·조판·QC 게이트까지 진행해 PDF를 냅니다. 여기서는
            그 첫 단계 — 스타일 선정과 목차 설계 — 만 웹에서 보여줍니다. 요청은 Cloudflare
            Worker를 거치고, <b>모델 API 키는 Worker의 secret으로만 존재합니다</b>.
          </p>
        </div>

        <div className="demo-shell">
          <form className="panel" onSubmit={run}>
            <div className="field">
              <label htmlFor="topic">주제 한 줄</label>
              <input
                id="topic"
                type="text"
                value={topic}
                maxLength={120}
                placeholder="예: 온디바이스 AI 2026 동향"
                onChange={(e) => setTopic(e.target.value)}
                disabled={!demoEnabled}
              />
              <div className="chips">
                {SAMPLES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className="chip"
                    onClick={() => setTopic(s)}
                    disabled={!demoEnabled}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="field">
              <label htmlFor="style">스타일</label>
              <select
                id="style"
                value={style}
                onChange={(e) => setStyle(e.target.value as "auto" | StyleId)}
                disabled={!demoEnabled}
              >
                <option value="auto">자동 선택 — 주제를 보고 스킬이 고른다</option>
                {styles.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.id} — {s.label}
                  </option>
                ))}
              </select>
            </div>

            <button className="btn btn-primary" type="submit" disabled={!demoEnabled || loading}>
              {loading ? (
                <>
                  <span className="spinner" /> 설계 중…
                </>
              ) : (
                "목차 설계하기"
              )}
            </button>

            {!demoEnabled && (
              <div className="alert" style={{ marginTop: 16 }}>
                <b>데모 API가 아직 연결되지 않았습니다.</b>
                <br />
                저장소의 <code className="inline">workers/bookforge-api</code>를 Cloudflare에
                배포하고, <code className="inline">web/site.config.ts</code>의{" "}
                <code className="inline">workerUrl</code>에 그 주소를 넣어 push 하면 이 데모가
                켜집니다. (또는 Vercel 환경변수{" "}
                <code className="inline">NEXT_PUBLIC_BOOKFORGE_API</code>)
              </div>
            )}
            {error && (
              <div className="alert err" style={{ marginTop: 16 }}>
                {error}
              </div>
            )}
            <p className="hint">
              전송되는 값은 주제 문자열과 스타일 선택뿐입니다. 결과는 저장되지 않습니다.
            </p>
          </form>

          <div className="panel result">
            {!result && (
              <p className="result-empty">
                왼쪽에 주제를 넣으면 표지 문안·스타일 선정 근거·장별 목차와 분량 배분이
                여기에 나타납니다.
              </p>
            )}
            {result && (
              <>
                <h3 className="bp-title">『{result.title}』</h3>
                <p className="bp-sub">{result.subtitle}</p>
                <div className="bp-row">
                  {picked && (
                    <span className="tag" style={{ background: picked.accent }}>
                      {result.style}
                    </span>
                  )}
                  <span style={{ fontSize: 13, color: "var(--ink-3)" }}>
                    {picked?.label} · 판형 {picked?.trim}mm · {result.lengthPreset} ·{" "}
                    {result.totalPages}쪽 예상
                  </span>
                </div>
                <p className="bp-reason">{result.styleReason}</p>
                <ol className="toc">
                  {result.chapters.map((c) => (
                    <li key={c.no}>
                      <span className="n">
                        {String(c.no).padStart(2, "0")}
                      </span>
                      <span className="t">{c.title}</span>
                      <span className="p">{c.pages}p</span>
                      <span className="s">{c.summary}</span>
                    </li>
                  ))}
                </ol>
              </>
            )}
          </div>
        </div>

        <div className="security-note">
          <div>
            <strong>키는 Cloudflare에만</strong>
            OpenAI API 키는 <code className="inline">wrangler secret</code>으로 Worker에만
            들어갑니다. 저장소·Vercel 빌드·브라우저 번들 어디에도 실리지 않습니다.
          </div>
          <div>
            <strong>Vercel은 정적 프런트만</strong>
            이 사이트는 키를 모릅니다. 아는 것은 Worker의 공개 URL뿐이라, 프런트가 유출돼도
            키는 새지 않습니다.
          </div>
          <div>
            <strong>Worker가 문지기</strong>
            Origin 화이트리스트, 입력 길이 제한, 출력 토큰 상한, 분당 요청 제한을 Worker가
            건 다음에야 모델로 넘어갑니다.
          </div>
        </div>
      </div>
    </section>
  );
}

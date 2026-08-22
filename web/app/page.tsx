import { books, gates, styles, styleById } from "@/lib/data";
import { siteConfig } from "@/site.config";
import Demo from "@/components/Demo";

const totalPages = books.reduce((n, b) => n + b.pages, 0);

function pdfHref(slug: string) {
  return `${siteConfig.rawBase}/examples/${slug}.pdf`;
}

export default function Home() {
  return (
    <>
      {/* ---------------- hero ---------------- */}
      <div className="hero">
        <div className="wrap">
          <span className="eyebrow">
            <b>v2.0.0</b> 도해 트랙 · 목차 정합 게이트 · 전량 TrueType
          </span>
          <h1 className="hero-title">
            주제 한 줄에서 상업도서급 전자책 PDF까지
          </h1>
          <p className="hero-lede">
            표지·리더선 목차·장 도비라·러닝 헤드·판권면까지 실제 단행본의 해부 구조를
            갖춘 PDF를 만듭니다. 콘텐츠는 마크다운으로만 쓰고, 조판은 6개 스타일 팩과
            스크립트가 전담하며, 품질은 QC 게이트가 물리적으로 강제합니다 — 게이트를
            통과하지 못한 PDF는 <code className="inline">final/</code>에 존재할 수 없습니다.
          </p>
          <div className="cta-row">
            <a className="btn btn-primary" href="#demo">
              목차 설계 데모 →
            </a>
            <a className="btn btn-ghost" href="#gallery">
              예시 9권 보기
            </a>
            <a
              className="btn btn-ghost"
              href={siteConfig.repo}
              target="_blank"
              rel="noreferrer"
            >
              저장소
            </a>
          </div>

          <dl className="stat-row">
            <div className="stat">
              <dt>예시 산출물</dt>
              <dd>
                9권 <small>· {totalPages}쪽</small>
              </dd>
            </div>
            <div className="stat">
              <dt>디자인 스타일 팩</dt>
              <dd>
                6종 <small>· Typst / Chromium</small>
              </dd>
            </div>
            <div className="stat">
              <dt>QC 게이트</dt>
              <dd>
                {gates.length}개 <small>· G0–G15</small>
              </dd>
            </div>
            <div className="stat">
              <dt>도해 트랙</dt>
              <dd>
                2종 <small>· antv + authored 11계열</small>
              </dd>
            </div>
            <div className="stat">
              <dt>Type3 글리프</dt>
              <dd>
                0건 <small>· G2가 하드 강제</small>
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* ---------------- gallery ---------------- */}
      <section id="gallery">
        <div className="wrap">
          <div className="section-head">
            <p className="section-kicker">Showcase</p>
            <h2>예시 9종 — 전부 이 스킬이 만든 실물입니다</h2>
            <p>
              여섯 스타일 중 <code className="inline">practical</code>·
              <code className="inline">insight</code>·
              <code className="inline">business</code> 세 스타일은 도해 트랙이 주인공인
              신작을 하나씩 더해 총 아홉 권입니다. 표지를 클릭하면 PDF 전문이 열립니다.
            </p>
          </div>
          <div className="gallery">
            {books.map((book) => {
              const style = styleById[book.style];
              return (
                <a
                  key={book.slug}
                  className="book"
                  href={pdfHref(book.slug)}
                  target="_blank"
                  rel="noreferrer"
                >
                  <div className="book-cover">
                    <img
                      src={`/showcase/${book.slug}-cover.webp`}
                      alt={`${book.title} 표지`}
                      width={760}
                      height={1100}
                      loading="lazy"
                    />
                  </div>
                  <div className="book-meta">
                    <span
                      className="tag"
                      style={{ background: style.accent }}
                    >
                      {book.style}
                    </span>
                    {book.diagramLed ? (
                      <span className="tag" style={{ background: "var(--ink-3)", marginLeft: 6 }}>
                        도해 중심
                      </span>
                    ) : null}
                    <h3>『{book.title}』</h3>
                    <p>
                      <span className="pages">{book.pages}쪽</span> · {book.note}
                    </p>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---------------- diagrams ---------------- */}
      <section id="diagrams">
        <div className="wrap">
          <div className="section-head">
            <p className="section-kicker">Diagram track</p>
            <h2>본문 도해는 이미지가 아니라 벡터입니다</h2>
            <p>
              도해는 에이전트가 사이드카 파일로 선언하고, 빌드가 정규화·검증까지 마쳐
              벡터로 얹습니다. <b>antv</b> 트랙은 순서·비교·계층·수치 추이를 AntV
              Infographic DSL로 선언하고, <b>authored</b> 트랙은 AntV 카탈로그가 덮지
              못하는 기술도해 11계열(시퀀스·상태머신·ER·스위밍레인·간트·레이더·벤·산점도·조직도·루프·권한
              매트릭스)을 에이전트가 SVG로 직접 그립니다. 두 트랙 모두 렌더 전 G0, 렌더 후
              G13으로 물리 검증됩니다.
            </p>
          </div>
          <div className="fig-row">
            <figure>
              <img
                src="/showcase/insight-agent-protocols-page6.webp"
                alt="insight 스타일 계층 트리 도해 지면"
                loading="lazy"
              />
              <figcaption>
                <b>insight</b> — 계층(트리)
              </figcaption>
            </figure>
            <figure>
              <img
                src="/showcase/business-automation-redesign-page9.webp"
                alt="business 스타일 스위밍레인 도해 지면"
                loading="lazy"
              />
              <figcaption>
                <b>business</b> — 스위밍레인
              </figcaption>
            </figure>
            <figure>
              <img
                src="/showcase/practical-home-server-page12.webp"
                alt="practical 스타일 플로우차트 도해 지면"
                loading="lazy"
              />
              <figcaption>
                <b>practical</b> — 플로우차트
              </figcaption>
            </figure>
          </div>

          <div className="section-head" style={{ marginTop: 56 }}>
            <h2 style={{ fontSize: 24 }}>목차 정합(G14)도 같은 세대 작업입니다</h2>
            <p>
              목차 쪽번호가 실제 폴리오와 어긋나거나 목차 색이 장 도비라와 다른 계열이면
              &ldquo;다른 책 같은 목차&rdquo;가 됩니다. G14가 이 자기일관성과 텍스트 대비
              하한을 전 면 스캔으로 잡습니다.
            </p>
          </div>
          <div className="fig-row two">
            <figure>
              <img
                src="/showcase/insight-agent-protocols-toc.webp"
                alt="insight 스타일 목차 지면"
                loading="lazy"
              />
              <figcaption>
                <b>insight</b> — 사이드 밴드·폴리오
              </figcaption>
            </figure>
            <figure>
              <img
                src="/showcase/business-automation-redesign-toc.webp"
                alt="business 스타일 목차 지면"
                loading="lazy"
              />
              <figcaption>
                <b>business</b> — 인디케이터·챕터 넘버
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* ---------------- styles ---------------- */}
      <section id="styles">
        <div className="wrap">
          <div className="section-head">
            <p className="section-kicker">Style packs</p>
            <h2>스타일 6종 — 실측을 증류한 규칙서</h2>
            <p>
              각 스타일은 실제 상업 출판물을 계측해 만든 규칙서(
              <code className="inline">styles/*/STYLE.md</code>)를 갖습니다. 판형 mm,
              폰트 pt, 행간 %, 컬러 토큰, 지면 템플릿, 금지 사항까지.
            </p>
          </div>
          <div className="style-grid">
            {styles.map((s) => (
              <div className="style-card" key={s.id}>
                <div className="swatch" style={{ background: s.accent }} />
                <div className="top">
                  <code>{s.id}</code>
                  <span className="label">{s.label}</span>
                </div>
                <p>{s.identity}</p>
                <div className="spec">
                  <span>판형 {s.trim}mm</span>
                  <span>{s.engine}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="fig-row" style={{ marginTop: 34 }}>
            <figure>
              <img src="/showcase/practical-prompt-patterns-page9.webp" alt="practical 내지" loading="lazy" />
              <figcaption>
                <b>practical</b> — 콜아웃·절차 지면
              </figcaption>
            </figure>
            <figure>
              <img src="/showcase/business-sme-ai-page9.webp" alt="business 내지" loading="lazy" />
              <figcaption>
                <b>business</b> — 표·데이터 근거
              </figcaption>
            </figure>
            <figure>
              <img src="/showcase/magazine-trend-brief-page6.webp" alt="magazine 내지" loading="lazy" />
              <figcaption>
                <b>magazine</b> — 이미지·풀퀘트 면
              </figcaption>
            </figure>
          </div>
          <div className="fig-row" style={{ marginTop: 24 }}>
            <figure>
              <img src="/showcase/academic-game-theory-page11.webp" alt="academic 내지" loading="lazy" />
              <figcaption>
                <b>academic</b> — 정의 박스·절 위계
              </figcaption>
            </figure>
            <figure>
              <img src="/showcase/essay-evening-sentences-page6.webp" alt="essay 내지" loading="lazy" />
              <figcaption>
                <b>essay</b> — 여백 낙차형 지면
              </figcaption>
            </figure>
            <figure>
              <img src="/showcase/insight-ondevice-ai-page10.webp" alt="insight 내지" loading="lazy" />
              <figcaption>
                <b>insight</b> — narrow 측정 표
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* ---------------- demo ---------------- */}
      <Demo />

      {/* ---------------- gates ---------------- */}
      <section id="gates">
        <div className="wrap">
          <div className="section-head">
            <p className="section-kicker">Quality gates</p>
            <h2>
              <code className="inline" style={{ fontSize: "0.8em" }}>final/</code>은
              게이트 스크립트만이 만들 수 있습니다
            </h2>
            <p>
              분량·밀도·폰트·목차·도해까지 {gates.length}개 게이트가 수치로 검사합니다.
              하나라도 걸리면 PDF는 <code className="inline">draft/</code>에 머뭅니다.
            </p>
          </div>
          <div className="gate-list">
            {gates.map((g) => (
              <div className="gate" key={g.id}>
                <span className="id">{g.id}</span>
                <span className="body">
                  <span className="when">{g.when}</span>
                  {g.check}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- install ---------------- */}
      <section id="install">
        <div className="wrap">
          <div className="section-head">
            <p className="section-kicker">Install</p>
            <h2>설치하고 에이전트에게 말하면 끝입니다</h2>
            <p>
              Claude Code와 OpenAI Codex 양쪽에서 동작합니다. 스킬이 모드(topic /
              manuscript)를 감지하고 스타일·분량을 정해 끝까지 진행합니다.
            </p>
          </div>
          <div className="demo-shell">
            <div>
              <pre>
                <span className="c"># 1. 스킬 설치</span>
                {"\n"}git clone {siteConfig.repo}.git{"\n"}cd bookforge{"\n"}
                {"\n"}
                <span className="c"># Claude Code · Codex 양쪽에 심링크</span>
                {"\n"}ln -sfn &quot;$PWD&quot; ~/.claude/skills/bookforge{"\n"}ln -sfn
                &quot;$PWD&quot; ~/.codex/skills/bookforge{"\n"}
              </pre>
              <pre style={{ marginTop: 16 }}>
                <span className="c"># 2. 에이전트에게 말한다</span>
                {"\n"}&quot;온디바이스 AI 동향을 insight 스타일 전자책으로 만들어줘&quot;
                {"\n"}&quot;이 원고(draft.docx)를 에세이집 PDF로 조판해줘&quot;{"\n"}
              </pre>
              <pre style={{ marginTop: 16 }}>
                <span className="c"># 수동 실행도 가능</span>
                {"\n"}python3 scripts/scaffold.py mybook --style essay \{"\n"}
                {"  "}--title &quot;제목&quot; --length short{"\n"}python3 scripts/build.py
                mybook{"\n"}python3 scripts/qc_gate.py mybook{"  "}
                <span className="c"># 통과 시에만 final/</span>
                {"\n"}
              </pre>
            </div>
            <div className="panel">
              <h3 style={{ marginBottom: 14 }}>요구 사항</h3>
              <ol className="steps">
                <li>
                  <h3>Typst 0.14+</h3>
                  <p>
                    <code className="inline">practical</code>·
                    <code className="inline">academic</code>·
                    <code className="inline">essay</code>·
                    <code className="inline">business</code> 렌더 엔진.
                  </p>
                </li>
                <li>
                  <h3>Python 3 + PyMuPDF + markdown-it-py</h3>
                  <p>변환과 QC 게이트가 쓰는 런타임.</p>
                </li>
                <li>
                  <h3>전역 Playwright (Chromium)</h3>
                  <p>
                    <code className="inline">insight</code>·
                    <code className="inline">magazine</code>, 그리고 도해를 쓰는 모든 책.
                    빌드는 <code className="inline">npm root -g</code>에서 해석하므로 전역
                    설치여야 합니다.
                  </p>
                </li>
              </ol>
              <p className="hint" style={{ marginTop: 18 }}>
                폰트는 OFL 5종(Pretendard·Noto Serif KR·Paperlogy·Gmarket Sans·Barlow)이
                전량 TrueType으로 저장소에 동봉되어 바로 렌더됩니다.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

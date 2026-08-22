export type StyleId =
  | "practical"
  | "insight"
  | "academic"
  | "essay"
  | "business"
  | "magazine";

export type Style = {
  id: StyleId;
  label: string;
  identity: string;
  trim: string;
  engine: string;
  accent: string;
};

export const styles: Style[] = [
  {
    id: "practical",
    label: "실용·활용서",
    identity:
      "서술은 명조(Noto Serif KR)로 낮게 깔고 조작·라벨·수치는 고딕(Pretendard)으로 세워 '읽는 글'과 '하는 글'을 서체로 분리한다.",
    trim: "153×225",
    engine: "Typst",
    accent: "#1f6f5c",
  },
  {
    id: "insight",
    label: "기술 동향 리포트",
    identity:
      "연구기관 인사이트 리포트의 문법 — 측정 표, 사이드 밴드, 데이터 근거가 지면의 뼈대다.",
    trim: "182×257",
    engine: "HTML→Chromium",
    accent: "#2b5ea8",
  },
  {
    id: "academic",
    label: "학술 단행본",
    identity:
      "신국판 본문에 3선표와 절 번호 위계, 정의 박스. 인용과 각주가 무너지지 않는 조판.",
    trim: "153×225",
    engine: "Typst",
    accent: "#6b4a8f",
  },
  {
    id: "essay",
    label: "미니멀 에세이",
    identity:
      "사륙판·먹 1도 + 포인트 1색. 여백의 낙차로 호흡을 만드는 지면.",
    trim: "128×188",
    engine: "Typst",
    accent: "#8a6a3a",
  },
  {
    id: "business",
    label: "컨설팅 백서",
    identity:
      "navy 시스템·액션 타이틀·키 스탯. 한 면이 하나의 주장을 증거와 함께 끝낸다.",
    trim: "200×280",
    engine: "Typst",
    accent: "#1c3f6e",
  },
  {
    id: "magazine",
    label: "트렌드 매거진",
    identity:
      "에디토리얼 그리드와 풀퀘트 면. 이미지가 지면을 지배하고 활자가 리듬을 잡는다.",
    trim: "200×265",
    engine: "HTML→Chromium",
    accent: "#a83b52",
  },
];

export const styleById = Object.fromEntries(
  styles.map((s) => [s.id, s]),
) as Record<StyleId, Style>;

export type Book = {
  slug: string;
  title: string;
  style: StyleId;
  pages: number;
  note: string;
  diagramLed?: boolean;
};

export const books: Book[] = [
  {
    slug: "practical-prompt-patterns",
    title: "바로 쓰는 프롬프트 패턴 24",
    style: "practical",
    pages: 45,
    note: "콜아웃과 절차 지면이 본문 리듬을 끌고 간다",
  },
  {
    slug: "insight-ondevice-ai",
    title: "온디바이스 AI 2026",
    style: "insight",
    pages: 28,
    note: "narrow 측정 표로 근거를 지면에 박아 넣는다",
  },
  {
    slug: "academic-game-theory",
    title: "게임이론의 기초",
    style: "academic",
    pages: 36,
    note: "정의 박스와 절 위계가 논증의 층을 만든다",
  },
  {
    slug: "essay-evening-sentences",
    title: "퇴근길의 문장들",
    style: "essay",
    pages: 32,
    note: "여백 낙차형 지면 — 비움이 규칙으로 관리된다",
  },
  {
    slug: "business-sme-ai",
    title: "중소기업 AI 도입 전략",
    style: "business",
    pages: 28,
    note: "표와 키 스탯이 주장마다 증거를 붙인다",
  },
  {
    slug: "magazine-trend-brief",
    title: "TREND BRIEF",
    style: "magazine",
    pages: 25,
    note: "이미지·풀퀘트 면의 에디토리얼 그리드",
  },
  {
    slug: "insight-agent-protocols",
    title: "AI 에이전트 프로토콜 2026",
    style: "insight",
    pages: 32,
    note: "계층(트리) 도해가 장의 중심에 선다",
    diagramLed: true,
  },
  {
    slug: "practical-home-server",
    title: "나만의 홈 서버",
    style: "practical",
    pages: 39,
    note: "플로우차트로 절차를 한 면에 접는다",
    diagramLed: true,
  },
  {
    slug: "business-automation-redesign",
    title: "업무 자동화 재설계",
    style: "business",
    pages: 31,
    note: "스위밍레인으로 책임 경계를 그린다",
    diagramLed: true,
  },
];

export type Gate = { id: string; when: string; check: string };

export const gates: Gate[] = [
  {
    id: "G0",
    when: "렌더 전",
    check:
      "도해 SVG 소스 — foreignObject 잔존·텍스트 부재·외부 참조·단독 문단 위반·사이드카 무결성·아이콘 탈락 차단",
  },
  {
    id: "G1",
    when: "렌더 후",
    check: "렌더 성공 + 판형(tokens.trim_mm) 대조 + 분량 프리셋 범위",
  },
  { id: "G2", when: "렌더 후", check: "폰트 전량 임베드 + Type3 글리프 0건" },
  { id: "G3", when: "렌더 후", check: "본문 bbox 오버플로 0 (허용오차 1.5pt)" },
  { id: "G4", when: "렌더 후", check: "목차·북마크 ↔ 실제 장 시작 쪽 정합" },
  { id: "G6", when: "검수", check: "콘택트시트 — 에이전트가 실물 페이지를 눈으로 확인" },
  {
    id: "G7",
    when: "렌더 후",
    check: "밀도 — 판면 드리프트·의도치 않은 빈 페이지·꼬리 미달·중간 공백",
  },
  { id: "G8", when: "렌더 후", check: "공기 채움(행간·자간을 늘린 억지 채움) 탐지" },
  { id: "G9", when: "렌더 후", check: "면 끝 제목 고립·widow (단일단 스타일)" },
  {
    id: "G10",
    when: "렌더 전",
    check: "콜아웃·인용·스탯 수치가 챕터 본문에 실재 — 날조 차단",
  },
  { id: "G11", when: "렌더 전", check: "pageroles.json(의도된 여백 사유 코드) 무결성" },
  { id: "G12", when: "렌더 후", check: "장 시작 직전 필러 백면 0" },
  {
    id: "G13",
    when: "렌더 후",
    check: "도해 라벨이 PDF 실텍스트로 존재 — SVG→PDF 텍스트 드롭 최종 포착",
  },
  {
    id: "G14",
    when: "렌더 후",
    check:
      "목차 쪽번호↔폴리오 자기일관 · 목차↔도비라 색상 계열 정합 · 유채색 텍스트 대비 WCAG 하한",
  },
  {
    id: "G15",
    when: "렌더 후",
    check: "지면 리듬(business 한정) — 단락 8행 초과 차단 · 무시각 연속 본문 면 상한",
  },
];

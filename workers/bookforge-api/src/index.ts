/**
 * bookforge demo API — Cloudflare Worker
 *
 * 이 Worker의 존재 이유는 하나다: OpenAI API 키를 브라우저와 Vercel 밖에 두는 것.
 * 키는 `wrangler secret put OPENAI_API_KEY` 로만 들어가고, 프런트엔드는 이 Worker의
 * 공개 URL만 안다. Worker는 Origin·입력 길이·요청 빈도를 검사한 뒤에야 모델을 호출한다.
 */
import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import * as z from "zod/v4";

export interface Env {
  /** wrangler secret put OPENAI_API_KEY */
  OPENAI_API_KEY: string;
  /** 쉼표로 구분한 허용 Origin. 예: "https://bookforge.vercel.app,https://*.vercel.app" */
  ALLOWED_ORIGINS?: string;
  /** 기본 gpt-5.5 */
  MODEL?: string;
  /** IP당 분당 요청 수. 기본 8 */
  RATE_LIMIT_PER_MIN?: string;
}

const DEFAULT_MODEL = "gpt-5.5";

/** reasoning 파라미터는 추론 모델에만 허용된다 — gpt-4o 계열에 보내면 400이 난다. */
function supportsReasoning(model: string): boolean {
  return /^(gpt-5|o[1-9])/.test(model);
}

const STYLES = [
  "practical",
  "insight",
  "academic",
  "essay",
  "business",
  "magazine",
] as const;

const MAX_TOPIC_LEN = 120;

const BlueprintSchema = z.object({
  title: z.string().describe("책 제목. 부제 없이, 서점 매대에서 통하는 한국어 제목"),
  subtitle: z.string().describe("표지에 얹을 한 줄 부제"),
  style: z.enum(STYLES).describe("선택한 bookforge 스타일 팩 ID"),
  styleReason: z
    .string()
    .describe("이 스타일을 고른 이유를 2~3문장으로. 주제의 성격과 독자를 근거로 든다"),
  lengthPreset: z
    .enum(["short", "standard", "long"])
    .describe("분량 프리셋. short 24~32쪽, standard 32~44쪽, long 44~60쪽"),
  chapters: z
    .array(
      z.object({
        no: z.number().describe("1부터 시작하는 장 번호"),
        title: z.string().describe("장 제목"),
        summary: z.string().describe("이 장이 다루는 내용 한 문장"),
        pages: z.number().describe("이 장에 배정한 본문 쪽수"),
      }),
    )
    .describe("5~8개의 장. 순서가 곧 논증의 순서다"),
});

type Blueprint = z.infer<typeof BlueprintSchema>;

const SYSTEM_PROMPT = `당신은 bookforge — 상업도서급 한국어 전자책 PDF를 만드는 조판 에이전트다.
지금은 파이프라인의 첫 단계, 즉 "스타일 선정과 목차 설계"만 수행한다.

스타일 팩 6종과 각각의 정체성:
- practical  (153×225) IT·실용 활용서. 절차·조작·체크리스트가 본문의 뼈대. 독자가 따라 하며 읽는 책.
- insight    (182×257) 기술 동향 리포트. 측정 표·데이터 근거·전망. 연구기관 인사이트의 문법.
- academic   (153×225) 학술 단행본. 정의·명제·절 번호 위계. 논증이 층으로 쌓인다.
- essay      (128×188) 미니멀 에세이. 1인칭 서술, 여백의 낙차. 정보 전달이 목적이 아닌 글.
- business   (200×280) 컨설팅 백서. 액션 타이틀·키 스탯·의사결정자를 향한 제언.
- magazine   (200×265) 트렌드 매거진. 에디토리얼 그리드·이미지 주도·짧은 호흡의 꼭지들.

규칙:
1. 스타일은 주제의 성격과 독자로 정한다. 유행이 아니라 지면 구조가 근거다.
2. 장은 5~8개. 각 장은 앞 장의 결론 위에 서야 하며, 목차만 읽어도 논증의 순서가 보여야 한다.
3. 쪽수는 장의 무게에 비례해 배정한다. 모든 장이 같은 쪽수인 목차는 설계하지 않은 목차다.
   장 쪽수의 합이 lengthPreset 범위(short 24~32, standard 32~44, long 44~60)에서 앞뒤 표지·목차·판권면
   6~8쪽을 뺀 값이 되도록 맞춘다.
4. 제목은 과장하지 않는다. 콜론으로 이어 붙인 부제형 제목이나 "완벽 가이드" 같은 상투구를 쓰지 않는다.
5. 모든 출력은 한국어. 고유명사와 기술 용어는 원어 그대로 둔다.`;

/* ------------------------------- CORS ---------------------------------- */

function originAllowed(origin: string | null, env: Env): boolean {
  if (!origin) return true; // 브라우저가 아닌 클라이언트(curl 등)
  const raw = (env.ALLOWED_ORIGINS ?? "").trim();
  if (!raw) return true; // 미설정 시 개방 — 배포 후 반드시 설정할 것
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .some((pattern) => {
      if (pattern === "*") return true;
      if (!pattern.includes("*")) return pattern === origin;
      const rx = new RegExp(
        "^" + pattern.split("*").map(escapeRegExp).join("[^/]*") + "$",
      );
      return rx.test(origin);
    });
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function corsHeaders(origin: string | null): Record<string, string> {
  return {
    "access-control-allow-origin": origin ?? "*",
    "access-control-allow-methods": "POST, GET, OPTIONS",
    "access-control-allow-headers": "content-type",
    "access-control-max-age": "86400",
    vary: "Origin",
  };
}

function json(
  body: unknown,
  status: number,
  origin: string | null,
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      ...corsHeaders(origin),
    },
  });
}

/* ---------------------------- rate limiting ----------------------------- */
/*
 * isolate 단위의 최선 노력 제한이다. 엄격한 전역 제한이 필요하면 Cloudflare 대시보드의
 * WAF → Rate limiting rules 로 /api/* 에 규칙을 하나 걸어라 (README 참고).
 */
const hits = new Map<string, number[]>();

function rateLimited(ip: string, perMin: number): boolean {
  const now = Date.now();
  const windowStart = now - 60_000;
  const recent = (hits.get(ip) ?? []).filter((t) => t > windowStart);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear(); // 메모리 상한
  return recent.length > perMin;
}

/* ------------------------------- handler -------------------------------- */

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get("Origin");
    const url = new URL(request.url);

    if (!originAllowed(origin, env)) {
      return json({ error: "이 Origin에서는 호출할 수 없습니다." }, 403, null);
    }

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    if (url.pathname === "/api/health") {
      return json(
        {
          ok: true,
          configured: Boolean(env.OPENAI_API_KEY),
          model: env.MODEL ?? DEFAULT_MODEL,
        },
        200,
        origin,
      );
    }

    if (url.pathname !== "/api/blueprint") {
      return json({ error: "Not found" }, 404, origin);
    }
    if (request.method !== "POST") {
      return json({ error: "POST만 허용됩니다." }, 405, origin);
    }
    if (!env.OPENAI_API_KEY) {
      return json(
        { error: "서버에 API 키가 설정되지 않았습니다. (wrangler secret put OPENAI_API_KEY)" },
        503,
        origin,
      );
    }

    const ip = request.headers.get("CF-Connecting-IP") ?? "unknown";
    const perMin = Number(env.RATE_LIMIT_PER_MIN ?? "8") || 8;
    if (rateLimited(ip, perMin)) {
      return json(
        { error: "요청이 몰렸습니다. 1분 뒤에 다시 시도해 주세요." },
        429,
        origin,
      );
    }

    let body: { topic?: unknown; style?: unknown };
    try {
      body = (await request.json()) as typeof body;
    } catch {
      return json({ error: "JSON 본문을 읽을 수 없습니다." }, 400, origin);
    }

    const topic = typeof body.topic === "string" ? body.topic.trim() : "";
    if (!topic) {
      return json({ error: "주제를 입력해 주세요." }, 400, origin);
    }
    if (topic.length > MAX_TOPIC_LEN) {
      return json(
        { error: `주제는 ${MAX_TOPIC_LEN}자 이내로 입력해 주세요.` },
        400,
        origin,
      );
    }

    const requestedStyle =
      typeof body.style === "string" &&
      (STYLES as readonly string[]).includes(body.style)
        ? (body.style as (typeof STYLES)[number])
        : null;

    const instruction = requestedStyle
      ? `주제: ${topic}\n\n스타일은 "${requestedStyle}"로 고정한다. styleReason에는 이 스타일의 지면 구조로 이 주제를 어떻게 풀지 설명한다.`
      : `주제: ${topic}\n\n스타일은 직접 고른다.`;

    const model = env.MODEL ?? DEFAULT_MODEL;
    const client = new OpenAI({ apiKey: env.OPENAI_API_KEY });

    try {
      const response = await client.responses.parse({
        model,
        instructions: SYSTEM_PROMPT,
        input: instruction,
        max_output_tokens: 8000,
        ...(supportsReasoning(model) ? { reasoning: { effort: "low" as const } } : {}),
        text: { format: zodTextFormat(BlueprintSchema, "book_blueprint") },
      });

      if (response.status === "incomplete") {
        console.error("incomplete response", response.incomplete_details?.reason);
        return json(
          { error: "설계가 도중에 끊겼습니다. 주제를 조금 줄여 다시 시도해 주세요." },
          502,
          origin,
        );
      }

      const parsed = response.output_parsed as Blueprint | null;
      if (!parsed) {
        return json(
          { error: "설계 결과를 해석하지 못했습니다. 다시 시도해 주세요." },
          502,
          origin,
        );
      }

      const chapters = parsed.chapters.map((c, i) => ({
        no: Math.round(c.no) || i + 1,
        title: c.title,
        summary: c.summary,
        pages: Math.max(1, Math.round(c.pages)),
      }));

      return json(
        {
          title: parsed.title,
          subtitle: parsed.subtitle,
          style: requestedStyle ?? parsed.style,
          styleReason: parsed.styleReason,
          lengthPreset: parsed.lengthPreset,
          chapters,
          // 앞뒤 표지·목차·판권면 7쪽을 더한 예상 총 분량
          totalPages: chapters.reduce((n, c) => n + c.pages, 0) + 7,
        },
        200,
        origin,
      );
    } catch (err) {
      if (err instanceof OpenAI.RateLimitError) {
        return json({ error: "모델 요청이 몰렸습니다. 잠시 후 다시 시도해 주세요." }, 429, origin);
      }
      if (err instanceof OpenAI.AuthenticationError) {
        return json({ error: "서버의 API 키가 유효하지 않습니다." }, 502, origin);
      }
      if (err instanceof OpenAI.APIError) {
        console.error("openai error", err.status, err.message);
        return json({ error: "모델 호출에 실패했습니다." }, 502, origin);
      }
      console.error("unexpected error", err);
      return json({ error: "알 수 없는 오류가 발생했습니다." }, 500, origin);
    }
  },
} satisfies ExportedHandler<Env>;

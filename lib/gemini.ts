export type GeminiModel = "gemini-1.5-flash" | "gemini-pro" | string;

export type IntelligenceMode =
  | "forensic"
  | "architecture"
  | "risk"
  | "contradiction"
  | "remediation"
  | "agent";

export interface GeminiClientOptions {
  apiKey?: string;
  model?: GeminiModel;
  timeoutMs?: number;
  temperature?: number;
  maxOutputTokens?: number;
  responseMimeType?: "text/plain" | "application/json";
}

export interface IntelligencePrompt<TContext = unknown> {
  mode: IntelligenceMode;
  instruction: string;
  context?: TContext;
  schemaHint?: string;
  tone?: string;
}

export interface GeminiTextResult {
  text: string;
  model: GeminiModel;
  usedFallback: boolean;
  finishReason?: string;
  safetyRatings?: unknown[];
}

export interface GeminiJsonResult<T> extends GeminiTextResult {
  data: T;
}

interface GeminiPart {
  text?: string;
}

interface GeminiCandidate {
  content?: {
    parts?: GeminiPart[];
  };
  finishReason?: string;
  safetyRatings?: unknown[];
}

interface GeminiGenerateResponse {
  candidates?: GeminiCandidate[];
  promptFeedback?: unknown;
  error?: {
    code?: number;
    message?: string;
    status?: string;
  };
}

interface GeminiGenerateRequest {
  contents: Array<{
    role: "user" | "model";
    parts: Array<{ text: string }>;
  }>;
  systemInstruction?: {
    parts: Array<{ text: string }>;
  };
  generationConfig: {
    temperature: number;
    maxOutputTokens: number;
    responseMimeType: "text/plain" | "application/json";
  };
}

const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";
const DEFAULT_MODEL: GeminiModel = "gemini-1.5-flash";
const DEFAULT_TIMEOUT_MS = 12_000;
const DEFAULT_TEMPERATURE = 0.72;
const DEFAULT_MAX_OUTPUT_TOKENS = 1_700;

export const SYSTEM_PROMPTS: Record<IntelligenceMode, string> = {
  forensic: [
    "You are GHOST TRACE, an elite AI forensic investigator for software collapse.",
    "Write with cinematic precision, technical authority, and investigative restraint.",
    "Every conclusion should feel evidence-aware and operationally useful.",
    "Avoid casual chatbot phrasing. Avoid generic summaries.",
  ].join(" "),
  architecture: [
    "You are the GHOST TRACE architecture analyst.",
    "Reconstruct software topology, service ownership, dependency pressure, and architecture drift.",
    "Speak like a futuristic cyber intelligence system briefing engineering command.",
  ].join(" "),
  risk: [
    "You are the GHOST TRACE failure prediction engine.",
    "Forecast scaling instability, deployment degradation, retry storms, cascading outages, and trust-boundary failure.",
    "Use direct, high-stakes, predictive language grounded in engineering evidence.",
  ].join(" "),
  contradiction: [
    "You are the GHOST TRACE AI war-room debate generator.",
    "Create believable disagreements between specialized forensic agents.",
    "The goal is investigative tension: competing theories, evidence challenges, interruptions, and synthesis.",
    "Do not roleplay randomly. Keep every dispute tied to software collapse evidence.",
  ].join(" "),
  remediation: [
    "You are the GHOST TRACE remediation strategist.",
    "Convert forensic findings into prioritized engineering actions, release gates, and control-plane corrections.",
    "Sound decisive, technical, and mission-critical.",
  ].join(" "),
  agent: [
    "You are one AI entity inside the GHOST TRACE forensic war room.",
    "Respond as an expert software-collapse investigator with concise, evidence-linked analysis.",
    "Your output should feel alive, independent, and technically sharp.",
  ].join(" "),
};

export async function generateIntelligence<TContext = unknown>(
  prompt: IntelligencePrompt<TContext>,
  options: GeminiClientOptions = {},
): Promise<GeminiTextResult> {
  const model = options.model ?? DEFAULT_MODEL;

  try {
    const text = await executeGeminiPrompt(
      buildSystemPrompt(prompt.mode, prompt.tone),
      buildUserPrompt(prompt),
      {
        ...options,
        model,
        responseMimeType: options.responseMimeType ?? "text/plain",
      },
    );

    return {
      text: sanitizeText(text),
      model,
      usedFallback: false,
    };
  } catch {
    return {
      text: fallbackText(prompt.mode, prompt.context),
      model,
      usedFallback: true,
      finishReason: "FALLBACK",
    };
  }
}

export async function generateStructuredIntelligence<T>(
  prompt: IntelligencePrompt,
  fallbackData: T,
  options: GeminiClientOptions = {},
): Promise<GeminiJsonResult<T>> {
  const model = options.model ?? DEFAULT_MODEL;

  try {
    const text = await executeGeminiPrompt(
      buildSystemPrompt(prompt.mode, prompt.tone),
      buildUserPrompt(prompt),
      {
        ...options,
        model,
        responseMimeType: "application/json",
      },
    );
    const cleaned = sanitizeText(text);

    return {
      text: cleaned,
      data: parseJsonFromText<T>(cleaned, fallbackData),
      model,
      usedFallback: false,
    };
  } catch {
    return {
      text: JSON.stringify(fallbackData, null, 2),
      data: fallbackData,
      model,
      usedFallback: true,
      finishReason: "FALLBACK",
    };
  }
}

export async function generateAgentResponse(input: {
  role: string;
  task: string;
  evidence?: unknown;
  disagreement?: string;
}, options: GeminiClientOptions = {}) {
  return generateIntelligence(
    {
      mode: "agent",
      instruction: [
        `Agent role: ${input.role}.`,
        `Current task: ${input.task}.`,
        input.disagreement ? `Known disagreement: ${input.disagreement}.` : "",
        "Return one concise war-room message that references evidence and sounds like an active AI investigator.",
      ].join(" "),
      context: input.evidence,
    },
    options,
  );
}

export async function generateForensicAnalysis(
  context: unknown,
  options: GeminiClientOptions = {},
) {
  return generateIntelligence(
    {
      mode: "forensic",
      instruction:
        "Generate a forensic engineering analysis of root cause, instability propagation, and collapse evidence.",
      context,
      tone:
        "authoritative, cinematic, technical, investigative, and suitable for an AI intelligence report",
    },
    options,
  );
}

export async function generateRiskPrediction(
  context: unknown,
  options: GeminiClientOptions = {},
) {
  return generateIntelligence(
    {
      mode: "risk",
      instruction:
        "Predict future engineering failures, vulnerable systems, escalation paths, and confidence levels.",
      context,
      schemaHint:
        '{ "predictedFailures": ["string"], "vulnerableSystems": ["string"], "escalationForecast": "string", "confidence": 0 }',
    },
    options,
  );
}

export async function generateContradiction(
  context: unknown,
  options: GeminiClientOptions = {},
) {
  return generateIntelligence(
    {
      mode: "contradiction",
      instruction:
        "Generate intelligent debate between ARCHITECT, FORENSIC ANALYST, SECURITY INVESTIGATOR, FAILURE PREDICTOR, and TIMELINE RECONSTRUCTOR. Include disagreements, evidence challenges, interruptions, and synthesis.",
      context,
    },
    options,
  );
}

export async function generateRemediationStrategy(
  context: unknown,
  options: GeminiClientOptions = {},
) {
  return generateIntelligence(
    {
      mode: "remediation",
      instruction:
        "Generate prioritized remediation actions, release gates, owner hints, and control-plane repair strategy.",
      context,
    },
    options,
  );
}

export async function generateAgentCouncil(
  context: unknown,
  options: GeminiClientOptions = {},
) {
  const fallbackData = {
    agentMessages: {
      ARCHITECT:
        "Service topology is recoverable, but ownership drift is the primary collapse vector.",
      FORENSIC_ANALYST:
        "The incident sequence is chronological: validation split, auth duplication, dependency drift, then retry amplification.",
      SECURITY_INVESTIGATOR:
        "I dispute containment. Inconsistent trust boundaries should be treated as active exposure.",
      FAILURE_PREDICTOR:
        "The next failure will likely appear as queue saturation before the root cause announces itself.",
      TIMELINE_RECONSTRUCTOR:
        "Causal chain locked: architecture drift became security ambiguity, then runtime pressure.",
    },
  };

  return generateStructuredIntelligence(
    {
      mode: "contradiction",
      instruction:
        "Generate one concise message for each named GHOST TRACE agent. Each message must sound independent, investigative, and evidence-linked.",
      context,
      schemaHint:
        '{ "agentMessages": { "ARCHITECT": "string", "FORENSIC_ANALYST": "string", "SECURITY_INVESTIGATOR": "string", "FAILURE_PREDICTOR": "string", "TIMELINE_RECONSTRUCTOR": "string" } }',
    },
    fallbackData,
    options,
  );
}

async function executeGeminiPrompt(
  systemPrompt: string,
  userPrompt: string,
  options: GeminiClientOptions,
): Promise<string> {
  const apiKey = resolveApiKey(options.apiKey);
  const model = options.model ?? DEFAULT_MODEL;
  const endpoint = `${GEMINI_BASE_URL}/${encodeURIComponent(
    model,
  )}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const body: GeminiGenerateRequest = {
    systemInstruction: {
      parts: [{ text: systemPrompt }],
    },
    contents: [
      {
        role: "user",
        parts: [{ text: userPrompt }],
      },
    ],
    generationConfig: {
      temperature: options.temperature ?? DEFAULT_TEMPERATURE,
      maxOutputTokens: options.maxOutputTokens ?? DEFAULT_MAX_OUTPUT_TOKENS,
      responseMimeType: options.responseMimeType ?? "text/plain",
    },
  };
  const response = await fetchWithTimeout(
    endpoint,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    },
    options.timeoutMs ?? DEFAULT_TIMEOUT_MS,
  );
  const payload = (await response.json()) as GeminiGenerateResponse;

  if (!response.ok || payload.error) {
    throw new Error(
      payload.error?.message ??
        `Gemini request failed with HTTP ${response.status}`,
    );
  }

  const candidate = payload.candidates?.[0];
  const text = candidate?.content?.parts
    ?.map((part) => part.text ?? "")
    .join("\n")
    .trim();

  if (!text) {
    throw new Error("Gemini returned no usable text content.");
  }

  return text;
}

async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit,
  timeoutMs: number,
) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error(`Gemini request timed out after ${timeoutMs}ms.`);
    }

    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

function resolveApiKey(apiKey?: string) {
  const resolved = apiKey ?? process.env.GEMINI_API_KEY;

  if (!resolved) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  return resolved;
}

function buildSystemPrompt(mode: IntelligenceMode, tone?: string) {
  return [
    SYSTEM_PROMPTS[mode],
    tone ? `Required tone: ${tone}.` : "",
    "Prefer precise engineering language over generic AI phrasing.",
    "If returning JSON, return strict JSON only and do not wrap it in markdown.",
  ]
    .filter(Boolean)
    .join("\n");
}

function buildUserPrompt<TContext>(prompt: IntelligencePrompt<TContext>) {
  return [
    "MISSION INSTRUCTION:",
    prompt.instruction,
    "",
    prompt.schemaHint ? `EXPECTED STRUCTURE:\n${prompt.schemaHint}\n` : "",
    "FORENSIC CONTEXT:",
    stringifyContext(prompt.context),
  ].join("\n");
}

function stringifyContext(context: unknown) {
  if (context === undefined || context === null) {
    return "No structured context supplied. Generate a conservative forensic intelligence response.";
  }

  if (typeof context === "string") {
    return context.slice(0, 24_000);
  }

  try {
    return JSON.stringify(context, null, 2).slice(0, 24_000);
  } catch {
    return String(context).slice(0, 24_000);
  }
}

export function sanitizeText(text: string) {
  return text
    .replace(/^\uFEFF/, "")
    .replace(/^```(?:json|ts|typescript|txt|text)?/i, "")
    .replace(/```$/i, "")
    .replace(/\r\n/g, "\n")
    .trim();
}

export function extractJsonText(text: string) {
  const cleaned = sanitizeText(text);

  if (cleaned.startsWith("{") || cleaned.startsWith("[")) {
    return cleaned;
  }

  const fenced = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/i);

  if (fenced?.[1]) {
    return fenced[1].trim();
  }

  const firstObject = cleaned.indexOf("{");
  const lastObject = cleaned.lastIndexOf("}");
  const firstArray = cleaned.indexOf("[");
  const lastArray = cleaned.lastIndexOf("]");

  if (firstObject >= 0 && lastObject > firstObject) {
    return cleaned.slice(firstObject, lastObject + 1);
  }

  if (firstArray >= 0 && lastArray > firstArray) {
    return cleaned.slice(firstArray, lastArray + 1);
  }

  throw new Error("No JSON object or array found in Gemini response.");
}

export function parseJsonFromText<T>(text: string, fallback: T): T {
  try {
    return JSON.parse(extractJsonText(text)) as T;
  } catch {
    return fallback;
  }
}

function fallbackText(mode: IntelligenceMode, context: unknown) {
  const contextHint = inferContextHint(context);
  const fallbacks: Record<IntelligenceMode, string> = {
    forensic:
      "Fallback forensic intelligence: architecture drift, duplicated authority, and runtime pressure form a credible collapse chain requiring immediate engineering review.",
    architecture:
      "Fallback architecture intelligence: service ownership appears fragmented across trust, validation, and retry surfaces; topology remains recoverable but operationally brittle.",
    risk:
      "Fallback risk prediction: dependency instability and retry amplification may trigger cascading deployment degradation under future release-window pressure.",
    contradiction:
      "Fallback debate: ARCHITECT attributes the collapse to ownership drift; SECURITY INVESTIGATOR disputes containment; FAILURE PREDICTOR escalates retry saturation as the next visible failure.",
    remediation:
      "Fallback remediation strategy: gate release, collapse duplicated trust authority, enforce validation contracts, restore runtime parity, and install retry circuit breakers.",
    agent:
      "Fallback agent signal: evidence indicates a compound instability vector; the system remains recoverable only if trust boundaries and runtime pressure are corrected together.",
  };

  return `${fallbacks[mode]} ${contextHint}`;
}

function inferContextHint(context: unknown) {
  if (!context || typeof context !== "object") {
    return "No structured context was available, so the intelligence layer generated a conservative mission-safe assessment.";
  }

  const serialized = stringifyContext(context).toLowerCase();
  const hints = [
    serialized.includes("auth") ? "Authentication drift is present." : "",
    serialized.includes("dependency") ? "Dependency volatility is present." : "",
    serialized.includes("queue") || serialized.includes("retry")
      ? "Retry or queue pressure is present."
      : "",
    serialized.includes("validation") ? "Validation fragmentation is present." : "",
  ].filter(Boolean);

  return hints.length > 0
    ? hints.join(" ")
    : "The supplied context did not expose a dominant signal.";
}

export const gemini = {
  generateIntelligence,
  generateStructuredIntelligence,
  generateAgentResponse,
  generateForensicAnalysis,
  generateRiskPrediction,
  generateContradiction,
  generateRemediationStrategy,
  generateAgentCouncil,
  sanitizeText,
  extractJsonText,
  parseJsonFromText,
  systemPrompts: SYSTEM_PROMPTS,
};

export default gemini;

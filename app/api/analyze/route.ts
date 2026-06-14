import { NextResponse, type NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type SeverityLevel = "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
type AgentStatus = "CONCURRING" | "DISPUTING" | "ESCALATING" | "SYNTHESIZED";

type AnalyzeRequest = {
  repositoryUrl?: string;
  repoUrl?: string;
  url?: string;
  codeContent?: string;
  uploadedCode?: string;
  content?: string;
  mockProjectStructure?: unknown;
  projectStructure?: unknown;
  files?: Array<{
    path?: string;
    name?: string;
    content?: string;
  }>;
  provider?: "openai" | "gemini" | "mock";
  model?: string;
};

type RepositoryEvidence = {
  sourceType: "repository-url" | "uploaded-code" | "mock-structure" | "unknown";
  repositoryUrl?: string;
  fileCount: number;
  sampledPaths: string[];
  detectedFrameworks: string[];
  detectedServices: string[];
  dependencySignals: string[];
  suspiciousPatterns: string[];
  duplicatedModules: string[];
  codeExcerpt: string;
};

type Summary = {
  projectOverview: string;
  detectedInstability: string;
  systemCondition: string;
  architecturalConcerns: string[];
};

type RiskScore = {
  overallRisk: number;
  stabilityScore: number;
  severityLevel: SeverityLevel;
  engineeringHealth: string;
};

type ArchitectureAnalysis = {
  detectedServices: string[];
  frontendStructure: string;
  backendStructure: string;
  dependencyConcerns: string[];
  duplicatedModules: string[];
  suspiciousPatterns: string[];
};

type TimelineEvent = {
  title: string;
  timestamp: string;
  severity: SeverityLevel;
  description: string;
};

type InvestigationAgent = {
  role:
    | "ARCHITECT"
    | "FORENSIC ANALYST"
    | "SECURITY INVESTIGATOR"
    | "FAILURE PREDICTOR"
    | "TIMELINE RECONSTRUCTOR";
  confidence: number;
  message: string;
  evidence: string[];
  status: AgentStatus;
};

type Verdict = {
  rootCause: string;
  engineeringCollapseExplanation: string;
  futureRisks: string[];
  scalingWarnings: string[];
  architecturalVerdict: string;
};

type PredictedFailure = {
  title: string;
  probability: number;
  severity: SeverityLevel;
  description: string;
  trigger: string;
};

type AnalyzeResponse = {
  summary: Summary;
  riskScore: RiskScore;
  architecture: ArchitectureAnalysis;
  timeline: TimelineEvent[];
  agents: InvestigationAgent[];
  verdict: Verdict;
  predictedFailures: PredictedFailure[];
};

const OPENAI_ENDPOINT = "https://api.openai.com/v1/chat/completions";
const GEMINI_MODEL = "gemini-1.5-flash";

export async function POST(request: NextRequest) {
  try {
    const payload = await readAnalyzeRequest(request);
    const evidence = extractRepositoryEvidence(payload);

    if (payload.provider !== "mock") {
      const aiResponse = await tryGenerateWithAi(payload, evidence);

      if (aiResponse) {
        return NextResponse.json(aiResponse, { status: 200 });
      }
    }

    return NextResponse.json(generateFallbackInvestigation(evidence), {
      status: 200,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "The investigation engine failed before evidence could be stabilized.";

    return NextResponse.json(
      {
        error: "GHOST_TRACE_ANALYSIS_FAILED",
        message,
      },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json(
    {
      error: "METHOD_NOT_ALLOWED",
      message:
        "GHOST TRACE investigation engine is armed for POST /api/analyze only.",
    },
    { status: 405 },
  );
}

async function readAnalyzeRequest(request: NextRequest): Promise<AnalyzeRequest> {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const file = formData.get("file");
    const codeContent =
      file instanceof File ? await file.text() : getFormValue(formData, "codeContent");

    return {
      repositoryUrl:
        getFormValue(formData, "repositoryUrl") ??
        getFormValue(formData, "repoUrl") ??
        getFormValue(formData, "url"),
      codeContent,
      mockProjectStructure: getFormValue(formData, "mockProjectStructure"),
      provider: normalizeProvider(getFormValue(formData, "provider")),
      model: getFormValue(formData, "model"),
    };
  }

  const text = await request.text();

  if (!text.trim()) {
    return {};
  }

  try {
    return JSON.parse(text) as AnalyzeRequest;
  } catch {
    return {
      codeContent: text,
    };
  }
}

function getFormValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" && value.trim() ? value : undefined;
}

function normalizeProvider(value?: string): AnalyzeRequest["provider"] {
  if (value === "openai" || value === "gemini" || value === "mock") {
    return value;
  }

  return undefined;
}

function extractRepositoryEvidence(payload: AnalyzeRequest): RepositoryEvidence {
  const repositoryUrl = payload.repositoryUrl ?? payload.repoUrl ?? payload.url;
  const rawCode =
    payload.codeContent ?? payload.uploadedCode ?? payload.content ?? "";
  const structure = payload.mockProjectStructure ?? payload.projectStructure;
  const fileEntries = normalizeFiles(payload.files, rawCode, structure);
  const sampledPaths = fileEntries.map((file) => file.path).slice(0, 60);
  const pathCorpus = sampledPaths.join("\n").toLowerCase();
  const contentCorpus = fileEntries
    .map((file) => `${file.path}\n${file.content ?? ""}`)
    .join("\n")
    .toLowerCase()
    .slice(0, 120_000);
  const corpus = `${pathCorpus}\n${contentCorpus}`;

  return {
    sourceType: determineSourceType(repositoryUrl, rawCode, structure),
    repositoryUrl,
    fileCount: fileEntries.length,
    sampledPaths,
    detectedFrameworks: detectFrameworks(corpus),
    detectedServices: detectServices(corpus),
    dependencySignals: detectDependencySignals(corpus),
    suspiciousPatterns: detectSuspiciousPatterns(corpus),
    duplicatedModules: detectDuplicatedModules(sampledPaths, corpus),
    codeExcerpt: fileEntries
      .map((file) => `FILE: ${file.path}\n${file.content ?? ""}`)
      .join("\n\n")
      .slice(0, 18_000),
  };
}

function normalizeFiles(
  files: AnalyzeRequest["files"],
  rawCode: string,
  structure: unknown,
) {
  if (Array.isArray(files) && files.length > 0) {
    return files.map((file, index) => ({
      path: file.path ?? file.name ?? `uploaded-file-${index + 1}.txt`,
      content: file.content ?? "",
    }));
  }

  if (rawCode.trim()) {
    return splitInlineProject(rawCode);
  }

  if (structure) {
    return flattenStructure(structure);
  }

  return [
    {
      path: "mock://ghost-trace-sample",
      content:
        "app/api/auth route duplicated with legacy-auth adapter, queue retry logic, package dependencies, deployment config",
    },
  ];
}

function splitInlineProject(rawCode: string) {
  const fileMarker = /(?:^|\n)(?:\/\/|#|--)?\s*(?:file|path):\s*([^\n]+)\n/gi;
  const matches = Array.from(rawCode.matchAll(fileMarker));

  if (matches.length === 0) {
    return [
      {
        path: "uploaded-code.txt",
        content: rawCode,
      },
    ];
  }

  return matches.map((match, index) => {
    const next = matches[index + 1];
    const start = (match.index ?? 0) + match[0].length;
    const end = next?.index ?? rawCode.length;

    return {
      path: match[1].trim(),
      content: rawCode.slice(start, end).trim(),
    };
  });
}

function flattenStructure(structure: unknown) {
  if (typeof structure === "string") {
    return splitInlineProject(structure);
  }

  const serialized = JSON.stringify(structure, null, 2);
  const paths = Array.from(serialized.matchAll(/"([^"]+\.[a-z0-9]+)"/gi)).map(
    (match) => match[1],
  );

  if (paths.length === 0) {
    return [
      {
        path: "mock-project-structure.json",
        content: serialized,
      },
    ];
  }

  return paths.slice(0, 120).map((path) => ({
    path,
    content: "",
  }));
}

function determineSourceType(
  repositoryUrl?: string,
  rawCode?: string,
  structure?: unknown,
): RepositoryEvidence["sourceType"] {
  if (repositoryUrl) {
    return "repository-url";
  }

  if (rawCode?.trim()) {
    return "uploaded-code";
  }

  if (structure) {
    return "mock-structure";
  }

  return "unknown";
}

function detectFrameworks(corpus: string) {
  return uniqueCompact([
    corpus.includes("next") || corpus.includes("app/") ? "Next.js" : "",
    corpus.includes("react") ? "React" : "",
    corpus.includes("express") ? "Express" : "",
    corpus.includes("nestjs") ? "NestJS" : "",
    corpus.includes("prisma") ? "Prisma" : "",
    corpus.includes("tailwind") ? "Tailwind CSS" : "",
    corpus.includes("vite") ? "Vite" : "",
    corpus.includes("django") ? "Django" : "",
    corpus.includes("fastapi") ? "FastAPI" : "",
  ]);
}

function detectServices(corpus: string) {
  return uniqueCompact([
    includesAny(corpus, ["auth", "session", "jwt", "oauth"]) ? "Auth" : "",
    includesAny(corpus, ["api/", "route.ts", "controller", "endpoint"])
      ? "API Gateway"
      : "",
    includesAny(corpus, ["db", "database", "prisma", "schema.sql"])
      ? "Data Layer"
      : "",
    includesAny(corpus, ["queue", "worker", "job", "bullmq"]) ? "Queue Workers" : "",
    includesAny(corpus, ["billing", "stripe", "invoice", "payment"])
      ? "Billing"
      : "",
    includesAny(corpus, ["deploy", "docker", "vercel", "kubernetes", "ci"])
      ? "Deployment Pipeline"
      : "",
    includesAny(corpus, ["admin", "dashboard", "console"]) ? "Admin Surface" : "",
  ]);
}

function detectDependencySignals(corpus: string) {
  return uniqueCompact([
    corpus.includes("package-lock") || corpus.includes("pnpm-lock")
      ? "Lockfile present, dependency graph is recoverable"
      : "",
    corpus.includes("\"*\"") || corpus.includes("latest")
      ? "Unbounded dependency version detected"
      : "",
    corpus.includes("legacy") || corpus.includes("deprecated")
      ? "Legacy or deprecated module signal detected"
      : "",
    corpus.includes("peer dependency") || corpus.includes("eresolve")
      ? "Peer dependency conflict signature present"
      : "",
  ]);
}

function detectSuspiciousPatterns(corpus: string) {
  return uniqueCompact([
    includesAny(corpus, ["todo", "fixme", "hack"]) ? "Unresolved engineering markers" : "",
    includesAny(corpus, ["any", "eslint-disable", "ts-ignore"])
      ? "Type-safety bypasses in critical paths"
      : "",
    includesAny(corpus, ["eval(", "new function", "dangerouslysetinnerhtml"])
      ? "Unsafe dynamic execution or rendering pattern"
      : "",
    includesAny(corpus, ["process.env", "secret", "api_key", "password"])
      ? "Secret-bearing configuration surface"
      : "",
    includesAny(corpus, ["retry", "timeout", "rate limit"])
      ? "Runtime pressure and retry behavior present"
      : "",
  ]);
}

function detectDuplicatedModules(paths: string[], corpus: string) {
  const duplicated = ["auth", "validation", "config", "logger", "client", "api"].filter(
    (moduleName) => {
      const pathHits = paths.filter((path) =>
        path.toLowerCase().includes(moduleName),
      ).length;
      const contentHits = corpus.split(moduleName).length - 1;

      return pathHits > 1 || contentHits > 5;
    },
  );

  return duplicated.map((moduleName) => `${moduleName} authority appears duplicated`);
}

function includesAny(value: string, terms: string[]) {
  return terms.some((term) => value.includes(term));
}

function uniqueCompact(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

async function tryGenerateWithAi(
  payload: AnalyzeRequest,
  evidence: RepositoryEvidence,
): Promise<AnalyzeResponse | null> {
  const preferredProvider =
    payload.provider ??
    (process.env.OPENAI_API_KEY
      ? "openai"
      : process.env.GEMINI_API_KEY
        ? "gemini"
        : "mock");

  try {
    if (preferredProvider === "openai" && process.env.OPENAI_API_KEY) {
      return await generateWithOpenAi(payload.model, evidence);
    }

    if (preferredProvider === "gemini" && process.env.GEMINI_API_KEY) {
      return await generateWithGemini(payload.model, evidence);
    }

    if (process.env.OPENAI_API_KEY) {
      return await generateWithOpenAi(payload.model, evidence);
    }

    if (process.env.GEMINI_API_KEY) {
      return await generateWithGemini(payload.model, evidence);
    }
  } catch (error) {
    console.error("GHOST TRACE AI provider failed, using fallback.", error);
  }

  return null;
}

async function generateWithOpenAi(model: string | undefined, evidence: RepositoryEvidence) {
  const response = await fetch(OPENAI_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: model ?? "gpt-4o-mini",
      temperature: 0.72,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: investigationSystemPrompt(),
        },
        {
          role: "user",
          content: investigationUserPrompt(evidence),
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI investigation failed with status ${response.status}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = data.choices?.[0]?.message?.content;

  return normalizeAiInvestigation(content, evidence);
}

async function generateWithGemini(model: string | undefined, evidence: RepositoryEvidence) {
  const selectedModel = model ?? GEMINI_MODEL;
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${process.env.GEMINI_API_KEY}`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      generationConfig: {
        temperature: 0.72,
        responseMimeType: "application/json",
      },
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `${investigationSystemPrompt()}\n\n${investigationUserPrompt(
                evidence,
              )}`,
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini investigation failed with status ${response.status}`);
  }

  const data = (await response.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

  return normalizeAiInvestigation(content, evidence);
}

function investigationSystemPrompt() {
  return [
    "You are GHOST TRACE, an AI forensic investigation engine for engineering collapse analysis.",
    "Return strict JSON only. Do not wrap in markdown.",
    "The investigation must feel authoritative, cinematic, technical, and demo-friendly.",
    "Simulate role-based sequential reasoning and debate across the five named agents.",
    "Agents may disagree, but every claim must reference evidence from the supplied repository signals.",
  ].join(" ");
}

function investigationUserPrompt(evidence: RepositoryEvidence) {
  return `
Generate this exact JSON shape:
{
  "summary": {
    "projectOverview": "string",
    "detectedInstability": "string",
    "systemCondition": "string",
    "architecturalConcerns": ["string"]
  },
  "riskScore": {
    "overallRisk": 0,
    "stabilityScore": 0,
    "severityLevel": "LOW|MODERATE|HIGH|CRITICAL",
    "engineeringHealth": "string"
  },
  "architecture": {
    "detectedServices": ["string"],
    "frontendStructure": "string",
    "backendStructure": "string",
    "dependencyConcerns": ["string"],
    "duplicatedModules": ["string"],
    "suspiciousPatterns": ["string"]
  },
  "timeline": [
    {
      "title": "string",
      "timestamp": "string",
      "severity": "LOW|MODERATE|HIGH|CRITICAL",
      "description": "string"
    }
  ],
  "agents": [
    {
      "role": "ARCHITECT|FORENSIC ANALYST|SECURITY INVESTIGATOR|FAILURE PREDICTOR|TIMELINE RECONSTRUCTOR",
      "confidence": 0,
      "message": "string",
      "evidence": ["string"],
      "status": "CONCURRING|DISPUTING|ESCALATING|SYNTHESIZED"
    }
  ],
  "verdict": {
    "rootCause": "string",
    "engineeringCollapseExplanation": "string",
    "futureRisks": ["string"],
    "scalingWarnings": ["string"],
    "architecturalVerdict": "string"
  },
  "predictedFailures": [
    {
      "title": "string",
      "probability": 0,
      "severity": "LOW|MODERATE|HIGH|CRITICAL",
      "description": "string",
      "trigger": "string"
    }
  ]
}

Repository evidence:
${JSON.stringify(evidence, null, 2)}
`;
}

function normalizeAiInvestigation(
  content: string | undefined,
  evidence: RepositoryEvidence,
): AnalyzeResponse {
  if (!content) {
    throw new Error("AI provider returned no investigation content.");
  }

  const parsed = JSON.parse(stripJsonFence(content)) as Partial<AnalyzeResponse>;
  const fallback = generateFallbackInvestigation(evidence);

  return {
    summary: {
      ...fallback.summary,
      ...parsed.summary,
      architecturalConcerns:
        parsed.summary?.architecturalConcerns ??
        fallback.summary.architecturalConcerns,
    },
    riskScore: {
      ...fallback.riskScore,
      ...parsed.riskScore,
      overallRisk: clampScore(
        parsed.riskScore?.overallRisk ?? fallback.riskScore.overallRisk,
      ),
      stabilityScore: clampScore(
        parsed.riskScore?.stabilityScore ?? fallback.riskScore.stabilityScore,
      ),
      severityLevel: normalizeSeverity(parsed.riskScore?.severityLevel),
    },
    architecture: {
      ...fallback.architecture,
      ...parsed.architecture,
      detectedServices:
        parsed.architecture?.detectedServices ??
        fallback.architecture.detectedServices,
      dependencyConcerns:
        parsed.architecture?.dependencyConcerns ??
        fallback.architecture.dependencyConcerns,
      duplicatedModules:
        parsed.architecture?.duplicatedModules ??
        fallback.architecture.duplicatedModules,
      suspiciousPatterns:
        parsed.architecture?.suspiciousPatterns ??
        fallback.architecture.suspiciousPatterns,
    },
    timeline: normalizeTimeline(parsed.timeline, fallback.timeline),
    agents: normalizeAgents(parsed.agents, fallback.agents),
    verdict: {
      ...fallback.verdict,
      ...parsed.verdict,
      futureRisks: parsed.verdict?.futureRisks ?? fallback.verdict.futureRisks,
      scalingWarnings:
        parsed.verdict?.scalingWarnings ?? fallback.verdict.scalingWarnings,
    },
    predictedFailures: normalizePredictedFailures(
      parsed.predictedFailures,
      fallback.predictedFailures,
    ),
  };
}

function stripJsonFence(content: string) {
  return content
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();
}

function normalizeTimeline(
  timeline: Partial<TimelineEvent>[] | undefined,
  fallback: TimelineEvent[],
) {
  if (!Array.isArray(timeline) || timeline.length === 0) {
    return fallback;
  }

  return timeline.slice(0, 8).map((event, index) => ({
    title: event.title ?? fallback[index % fallback.length].title,
    timestamp: event.timestamp ?? fallback[index % fallback.length].timestamp,
    severity: normalizeSeverity(event.severity),
    description:
      event.description ?? fallback[index % fallback.length].description,
  }));
}

function normalizeAgents(
  agents: Partial<InvestigationAgent>[] | undefined,
  fallback: InvestigationAgent[],
) {
  if (!Array.isArray(agents) || agents.length === 0) {
    return fallback;
  }

  return fallback.map((fallbackAgent) => {
    const agent =
      agents.find((candidate) => candidate.role === fallbackAgent.role) ??
      fallbackAgent;

    return {
      role: fallbackAgent.role,
      confidence: clampScore(agent.confidence ?? fallbackAgent.confidence),
      message: agent.message ?? fallbackAgent.message,
      evidence: Array.isArray(agent.evidence)
        ? agent.evidence.slice(0, 5)
        : fallbackAgent.evidence,
      status: normalizeAgentStatus(agent.status),
    };
  });
}

function normalizePredictedFailures(
  failures: Partial<PredictedFailure>[] | undefined,
  fallback: PredictedFailure[],
) {
  if (!Array.isArray(failures) || failures.length === 0) {
    return fallback;
  }

  return failures.slice(0, 8).map((failure, index) => ({
    title: failure.title ?? fallback[index % fallback.length].title,
    probability: clampScore(failure.probability ?? fallback[index % fallback.length].probability),
    severity: normalizeSeverity(failure.severity),
    description:
      failure.description ?? fallback[index % fallback.length].description,
    trigger: failure.trigger ?? fallback[index % fallback.length].trigger,
  }));
}

function normalizeSeverity(value: unknown): SeverityLevel {
  if (
    value === "LOW" ||
    value === "MODERATE" ||
    value === "HIGH" ||
    value === "CRITICAL"
  ) {
    return value;
  }

  return "HIGH";
}

function normalizeAgentStatus(value: unknown): AgentStatus {
  if (
    value === "CONCURRING" ||
    value === "DISPUTING" ||
    value === "ESCALATING" ||
    value === "SYNTHESIZED"
  ) {
    return value;
  }

  return "CONCURRING";
}

function clampScore(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(value)));
}

function generateFallbackInvestigation(evidence: RepositoryEvidence): AnalyzeResponse {
  const instabilityWeight =
    evidence.suspiciousPatterns.length * 8 +
    evidence.duplicatedModules.length * 10 +
    evidence.dependencySignals.length * 5 +
    (evidence.detectedServices.length > 4 ? 8 : 0);
  const overallRisk = clampScore(58 + instabilityWeight);
  const stabilityScore = clampScore(100 - overallRisk + 18);
  const severityLevel = riskToSeverity(overallRisk);
  const services = ensureList(evidence.detectedServices, [
    "Auth",
    "API Gateway",
    "Data Layer",
    "Deployment Pipeline",
  ]);
  const dependencyConcerns = ensureList(evidence.dependencySignals, [
    "Dependency graph requires provider-backed inspection",
    "Runtime packages may be carrying hidden upgrade pressure",
  ]);
  const duplicatedModules = ensureList(evidence.duplicatedModules, [
    "auth authority appears duplicated",
    "validation authority appears fragmented",
  ]);
  const suspiciousPatterns = ensureList(evidence.suspiciousPatterns, [
    "Boundary enforcement could not be proven from supplied evidence",
    "Operational ownership is unclear across runtime layers",
  ]);

  return {
    summary: {
      projectOverview: buildProjectOverview(evidence, services),
      detectedInstability:
        "The repository shows a compounding instability signature: duplicated authority, uneven validation pressure, and deployment-sensitive runtime paths are converging into a single failure corridor.",
      systemCondition:
        severityLevel === "CRITICAL"
          ? "CRITICAL: the system is coherent enough to run, but brittle enough to fail under release pressure."
          : "UNSTABLE: the system remains recoverable, but its fault lines are already visible.",
      architecturalConcerns: [
        "Service boundaries appear discoverable but not consistently enforced.",
        "Authentication and validation surfaces may be split across competing modules.",
        "Dependency and deployment signals suggest production behavior may diverge from local expectations.",
        "Scaling risk is concentrated around retries, queue pressure, and internal API trust.",
      ],
    },
    riskScore: {
      overallRisk,
      stabilityScore,
      severityLevel,
      engineeringHealth:
        overallRisk >= 85
          ? "Severe architectural stress with near-term collapse probability."
          : "Degraded but recoverable if ownership, validation, and dependencies are stabilized.",
    },
    architecture: {
      detectedServices: services,
      frontendStructure: describeFrontend(evidence),
      backendStructure: describeBackend(evidence, services),
      dependencyConcerns,
      duplicatedModules,
      suspiciousPatterns,
    },
    timeline: buildTimeline(severityLevel),
    agents: buildAgents(evidence, overallRisk, services, duplicatedModules),
    verdict: {
      rootCause:
        "The probable root cause is architectural drift: trust, validation, and runtime responsibility have spread across multiple modules without a single enforceable system boundary.",
      engineeringCollapseExplanation:
        "GHOST TRACE reconstructs the collapse path as gradual rather than sudden. The codebase likely accumulated parallel auth logic, partial validation, and dependency fragility until routine scaling pressure began amplifying every inconsistency.",
      futureRisks: [
        "Authorization behavior may diverge between frontend assumptions and backend enforcement.",
        "Validation gaps can become data corruption or privilege escalation paths.",
        "Dependency upgrades may trigger runtime regressions in unrelated services.",
        "Incident response will slow down if ownership remains split across duplicate modules.",
      ],
      scalingWarnings: [
        "Retry loops can saturate workers faster than dashboards reveal.",
        "Database connection pressure may appear as intermittent auth or API failures.",
        "Queue backlogs will convert small latency spikes into cascading release incidents.",
      ],
      architecturalVerdict:
        "The platform is not beyond repair, but it is past the point where cosmetic fixes are credible. Consolidate trust boundaries, retire duplicate modules, and rebuild validation as a first-class system layer.",
    },
    predictedFailures: [
      {
        title: "Authentication Inconsistency",
        probability: clampScore(overallRisk - 6),
        severity: "CRITICAL",
        description:
          "Parallel identity checks can issue contradictory access decisions across route handlers, services, and background workers.",
        trigger: "New role model, SSO migration, or session refresh under load",
      },
      {
        title: "Performance Degradation Cascade",
        probability: clampScore(overallRisk - 11),
        severity: "HIGH",
        description:
          "Retry behavior and hidden coupling can convert ordinary latency into queue saturation and API timeout storms.",
        trigger: "Traffic spike, provider slowdown, or slow database migration",
      },
      {
        title: "Security Boundary Erosion",
        probability: clampScore(overallRisk - 14),
        severity: "HIGH",
        description:
          "Validation gaps at internal ingress points may allow malformed data to reach privileged code paths.",
        trigger: "New integration, webhook expansion, or admin endpoint reuse",
      },
      {
        title: "Deployment Instability",
        probability: clampScore(overallRisk - 18),
        severity: severityLevel,
        description:
          "Environment-specific configuration and dependency drift can produce failures that do not reproduce locally.",
        trigger: "Dependency upgrade, build cache miss, or environment variable rotation",
      },
    ],
  };
}

function ensureList(values: string[], fallback: string[]) {
  return values.length > 0 ? values : fallback;
}

function riskToSeverity(risk: number): SeverityLevel {
  if (risk >= 85) {
    return "CRITICAL";
  }

  if (risk >= 70) {
    return "HIGH";
  }

  if (risk >= 45) {
    return "MODERATE";
  }

  return "LOW";
}

function buildProjectOverview(evidence: RepositoryEvidence, services: string[]) {
  const source =
    evidence.sourceType === "repository-url"
      ? `repository at ${evidence.repositoryUrl}`
      : evidence.sourceType.replace("-", " ");
  const frameworkPhrase =
    evidence.detectedFrameworks.length > 0
      ? ` It carries ${evidence.detectedFrameworks.join(", ")} signals.`
      : "";

  return `GHOST TRACE ingested ${source} and reconstructed ${services.length} active service zones: ${services.join(
    ", ",
  )}.${frameworkPhrase}`;
}

function describeFrontend(evidence: RepositoryEvidence) {
  if (includesAny(evidence.detectedFrameworks.join(" ").toLowerCase(), ["next", "react", "vite"])) {
    return "Frontend surface detected with component-driven routing and likely client/server state boundaries.";
  }

  return "Frontend structure is not explicit in the supplied evidence; UI risk remains inferred from API and auth coupling.";
}

function describeBackend(evidence: RepositoryEvidence, services: string[]) {
  const apiSignal = services.includes("API Gateway")
    ? "API route or controller surface detected."
    : "API surface is implied but not fully mapped.";
  const dataSignal = services.includes("Data Layer")
    ? "Data layer is visible and should be inspected for migration and connection pressure."
    : "Data layer evidence is thin, which increases forensic uncertainty.";

  return `${apiSignal} ${dataSignal}`;
}

function buildTimeline(severityLevel: SeverityLevel): TimelineEvent[] {
  return [
    {
      title: "Auth Duplication Introduced",
      timestamp: "T+00:03:12",
      severity: "HIGH",
      description:
        "Identity authority appears to have split between legacy and active modules, creating contradictory trust decisions.",
    },
    {
      title: "Validation Layer Fragmented",
      timestamp: "T+00:08:44",
      severity: "HIGH",
      description:
        "Input safety moved from a system rule into scattered local checks, leaving internal ingress points exposed.",
    },
    {
      title: "Dependency Instability Began",
      timestamp: "T+00:12:06",
      severity: "MODERATE",
      description:
        "Package and runtime signals suggest the dependency graph can mutate faster than the architecture can absorb.",
    },
    {
      title: "Scaling Degradation Detected",
      timestamp: "T+00:17:29",
      severity: severityLevel,
      description:
        "Queue, retry, and deployment pressure converge into a plausible cascade under elevated traffic.",
    },
    {
      title: "Forensic Verdict Locked",
      timestamp: "T+00:22:51",
      severity: severityLevel,
      description:
        "Agent consensus identifies architecture drift as the primary collapse vector, despite disagreement over the first failing subsystem.",
    },
  ];
}

function buildAgents(
  evidence: RepositoryEvidence,
  risk: number,
  services: string[],
  duplicatedModules: string[],
): InvestigationAgent[] {
  const pathEvidence =
    evidence.sampledPaths.length > 0
      ? evidence.sampledPaths.slice(0, 3)
      : ["No concrete file paths supplied"];

  return [
    {
      role: "ARCHITECT",
      confidence: clampScore(risk + 5),
      message:
        "Service topology is readable, but I dispute the idea that this is only a dependency problem. The deeper fracture is boundary ownership.",
      evidence: [
        `${services.length} service zones reconstructed`,
        ...pathEvidence,
      ],
      status: "DISPUTING",
    },
    {
      role: "FORENSIC ANALYST",
      confidence: clampScore(risk + 2),
      message:
        "The collapse signature is chronological: duplicate authority first, fragmented validation second, runtime pressure last.",
      evidence: duplicatedModules.slice(0, 3),
      status: "CONCURRING",
    },
    {
      role: "SECURITY INVESTIGATOR",
      confidence: clampScore(risk - 3),
      message:
        "I disagree with the optimistic stability read. Any split auth surface should be treated as an active breach corridor until proven otherwise.",
      evidence: ensureList(evidence.suspiciousPatterns, [
        "Validation and trust boundaries require manual confirmation",
      ]).slice(0, 4),
      status: "ESCALATING",
    },
    {
      role: "FAILURE PREDICTOR",
      confidence: clampScore(risk - 1),
      message:
        "The next failure will probably not announce itself as architecture drift. It will look like latency, retries, and intermittent deployment failure.",
      evidence: [
        "Queue, retry, timeout, or deployment pressure present in repository signals",
        `Computed systemic risk ${risk}%`,
      ],
      status: "ESCALATING",
    },
    {
      role: "TIMELINE RECONSTRUCTOR",
      confidence: clampScore(risk + 7),
      message:
        "The agents disagree on the first subsystem to fail, but the sequence is stable: drift, duplication, instability, saturation.",
      evidence: [
        "Timeline aligns duplicated modules with dependency and runtime pressure",
        `Source type: ${evidence.sourceType}`,
      ],
      status: "SYNTHESIZED",
    },
  ];
}

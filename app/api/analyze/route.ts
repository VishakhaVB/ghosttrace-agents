import { analyzeRepository } from "@/agents/orchestrator";
import type { OrchestratedInvestigation } from "@/agents/orchestrator";
import type {
  AnalyzeFileInput,
  AnalyzeRequest,
  ApiSeverityLevel,
  RiskSeverity,
} from "@/types";
import { NextResponse, type NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ApiAnalyzeResponse = OrchestratedInvestigation & {
  architectureReport: OrchestratedInvestigation["architecture"];
  riskScore: {
    overallRisk: number;
    stabilityScore: number;
    severityLevel: ApiSeverityLevel;
    engineeringHealth: string;
  };
  metadata: OrchestratedInvestigation["metadata"] & {
    routeLatencyMs: number;
    routeWarning?: string;
  };
};

export async function POST(request: NextRequest) {
  const startedAt = Date.now();

  try {
    const payload = await readAnalyzeRequest(request);
    const investigation = await analyzeRepository(payload, {
      provider: payload.provider,
      model: payload.model,
      timeoutMs: 12_000,
      forceMock: payload.provider === "mock",
    });

    return NextResponse.json(toApiResponse(investigation, startedAt), {
      status: 200,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "The investigation engine failed before evidence could be stabilized.";
    const fallback = await analyzeRepository(
      {
        metadata: {
          failure: message,
          fallbackReason: "api-route-exception",
        },
        provider: "mock",
      },
      {
        forceMock: true,
        provider: "mock",
      },
    );

    return NextResponse.json(toApiResponse(fallback, startedAt, message), {
      status: 200,
    });
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
    return readMultipartRequest(await request.formData());
  }

  const text = await request.text();

  if (!text.trim()) {
    return {};
  }

  try {
    return normalizeRequest(JSON.parse(text));
  } catch {
    return {
      codeContent: text,
      metadata: {
        source: "raw-text-request",
      },
    };
  }
}

async function readMultipartRequest(formData: FormData): Promise<AnalyzeRequest> {
  const file = formData.get("file");
  const uploadedFile =
    file instanceof File
      ? {
          path: file.name,
          name: file.name,
          content: await readFileEvidence(file),
          sizeBytes: file.size,
        }
      : undefined;
  const files = [
    ...readJsonArray<AnalyzeFileInput>(getFormValue(formData, "files")),
    ...(uploadedFile ? [uploadedFile] : []),
  ];

  return normalizeRequest({
    repositoryUrl:
      getFormValue(formData, "repositoryUrl") ??
      getFormValue(formData, "repoUrl") ??
      getFormValue(formData, "url"),
    repoUrl: getFormValue(formData, "repoUrl"),
    url: getFormValue(formData, "url"),
    codeContent:
      getFormValue(formData, "codeContent") ??
      getFormValue(formData, "uploadedCode") ??
      getFormValue(formData, "content"),
    mockProjectStructure: readJsonValue(getFormValue(formData, "mockProjectStructure")),
    projectStructure: readJsonValue(getFormValue(formData, "projectStructure")),
    files: files.length > 0 ? files : undefined,
    provider: normalizeProvider(getFormValue(formData, "provider")),
    model: getFormValue(formData, "model"),
    metadata: readJsonRecord(getFormValue(formData, "metadata")),
  });
}

function normalizeRequest(value: unknown): AnalyzeRequest {
  if (!isRecord(value)) {
    return {};
  }

  return {
    repositoryUrl: readString(value.repositoryUrl),
    repoUrl: readString(value.repoUrl),
    url: readString(value.url),
    codeContent: readString(value.codeContent),
    uploadedCode: readString(value.uploadedCode),
    content: readString(value.content),
    mockProjectStructure: value.mockProjectStructure,
    projectStructure: value.projectStructure,
    files: Array.isArray(value.files)
      ? value.files.map((file, index) => normalizeFileInput(file, index))
      : undefined,
    provider: normalizeProvider(readString(value.provider)),
    model: readString(value.model),
    metadata: isRecord(value.metadata) ? value.metadata : undefined,
  };
}

function normalizeFileInput(value: unknown, index: number): AnalyzeFileInput {
  const record = isRecord(value) ? value : {};

  return {
    path: readString(record.path) ?? readString(record.name) ?? `uploaded-file-${index + 1}.txt`,
    name: readString(record.name),
    content: readString(record.content),
    language: readString(record.language),
    sizeBytes:
      typeof record.sizeBytes === "number" && Number.isFinite(record.sizeBytes)
        ? record.sizeBytes
        : undefined,
  };
}

async function readFileEvidence(file: File): Promise<string> {
  if (file.size > 3_000_000) {
    return `FILE: ${file.name}\nLarge repository package staged for forensic metadata analysis. Size: ${file.size} bytes.`;
  }

  try {
    return await file.text();
  } catch {
    return `FILE: ${file.name}\nBinary repository evidence received; text extraction unavailable in API route.`;
  }
}

function toApiResponse(
  investigation: OrchestratedInvestigation,
  startedAt: number,
  routeWarning?: string,
): ApiAnalyzeResponse {
  return {
    ...investigation,
    architectureReport: investigation.architecture,
    riskScore: {
      overallRisk: investigation.riskMetrics.riskScore,
      stabilityScore: investigation.riskMetrics.stabilityScore,
      severityLevel: toApiSeverity(investigation.riskMetrics.severity),
      engineeringHealth: investigation.riskMetrics.engineeringHealth,
    },
    metadata: {
      ...investigation.metadata,
      routeLatencyMs: Date.now() - startedAt,
      routeWarning,
    },
  };
}

function toApiSeverity(severity: RiskSeverity): ApiSeverityLevel {
  if (severity === "critical") {
    return "CRITICAL";
  }

  if (severity === "high") {
    return "HIGH";
  }

  if (severity === "medium") {
    return "MODERATE";
  }

  return "LOW";
}

function getFormValue(formData: FormData, key: string): string | undefined {
  const value = formData.get(key);
  return typeof value === "string" && value.trim() ? value : undefined;
}

function readString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}

function normalizeProvider(value?: string): AnalyzeRequest["provider"] {
  if (value === "openai" || value === "gemini" || value === "mock") {
    return value;
  }

  return undefined;
}

function readJsonValue(value?: string): unknown {
  if (!value) {
    return undefined;
  }

  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function readJsonRecord(value?: string): Record<string, unknown> | undefined {
  const parsed = readJsonValue(value);
  return isRecord(parsed) ? parsed : undefined;
}

function readJsonArray<T>(value?: string): T[] {
  const parsed = readJsonValue(value);
  return Array.isArray(parsed) ? (parsed as T[]) : [];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

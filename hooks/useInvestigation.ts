"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  AgentData,
  AnalyzeFileInput,
  AnalyzeRequest,
  AnalyzeResponse,
  ApiSeverityLevel,
  ArchitectureReport,
  ForensicVerdict,
  InvestigationPhase,
  LegacyAnalyzeResponse,
  LoadingState,
  PredictedFailure,
  RiskOverview,
  RiskSeverity,
  SystemStatus,
} from "@/types";

export type CinematicInvestigationPhase =
  | "awaiting_input"
  | "initializing_forensic_engine"
  | "parsing_repository_intelligence"
  | "activating_ai_agents"
  | "reconstructing_failure_timeline"
  | "predicting_engineering_risks"
  | "running_contradiction_analysis"
  | "generating_forensic_verdict"
  | "investigation_complete"
  | "investigation_failed";

export type InvestigationStatus =
  | SystemStatus
  | "forensic_engine_online"
  | "repository_trace_active"
  | "agent_council_active"
  | "timeline_reconstruction"
  | "risk_projection"
  | "contradiction_debate"
  | "verdict_synthesis"
  | "fallback_mode";

export interface InvestigationFileInput extends AnalyzeFileInput {
  file?: File;
}

export interface StartInvestigationInput extends Partial<AnalyzeRequest> {
  githubUrl?: string;
  file?: File | null;
  files?: InvestigationFileInput[];
  repositoryIntelligence?: unknown;
  uploadedProjectMetadata?: Record<string, unknown>;
  forceMockFallback?: boolean;
}

export interface InvestigationControllerOptions {
  endpoint?: string;
  timeoutMs?: number;
  minimumPhaseDurationMs?: number;
  enableMockFallback?: boolean;
  autoResetAbortController?: boolean;
}

export interface InvestigationPhaseSnapshot {
  phase: CinematicInvestigationPhase;
  status: InvestigationStatus;
  progress: number;
  message: string;
  timestamp: string;
}

export interface InvestigationControllerData extends AnalyzeResponse {
  raw: unknown;
  usedFallback: boolean;
  generatedAt: string;
}

export interface InvestigationControllerState {
  loading: boolean;
  loadingState: LoadingState;
  progress: number;
  phase: CinematicInvestigationPhase;
  status: InvestigationStatus;
  data: InvestigationControllerData | null;
  error: string | null;
  phaseHistory: InvestigationPhaseSnapshot[];
  retryCount: number;
}

export interface InvestigationControllerReturn extends InvestigationControllerState {
  startInvestigation: (input?: StartInvestigationInput) => Promise<InvestigationControllerData>;
  resetInvestigation: () => void;
  retryInvestigation: () => Promise<InvestigationControllerData | null>;
  updatePhase: (
    phase: CinematicInvestigationPhase,
    progress?: number,
    message?: string,
  ) => void;
  simulateProgress: (targetProgress?: number) => void;
}

interface PhaseDefinition {
  phase: CinematicInvestigationPhase;
  apiPhase: InvestigationPhase;
  status: InvestigationStatus;
  progress: number;
  message: string;
  durationMs: number;
}

interface NormalizedApiPayload {
  request: AnalyzeRequest;
  hasMultipartFile: boolean;
  file?: File;
}

type BrowserInterval = number;
type BrowserTimeout = number;

const DEFAULT_ENDPOINT = "/api/analyze";
const DEFAULT_TIMEOUT_MS = 75_000;
const DEFAULT_PHASE_DURATION_MS = 520;
const PROGRESS_TICK_MS = 180;

const INVESTIGATION_PHASES: PhaseDefinition[] = [
  {
    phase: "initializing_forensic_engine",
    apiPhase: "ingesting_repository",
    status: "forensic_engine_online",
    progress: 8,
    message: "Initializing forensic engine and sealing evidence channel.",
    durationMs: 420,
  },
  {
    phase: "parsing_repository_intelligence",
    apiPhase: "mapping_architecture",
    status: "repository_trace_active",
    progress: 22,
    message: "Parsing repository intelligence, file topology, and dependency residue.",
    durationMs: 620,
  },
  {
    phase: "activating_ai_agents",
    apiPhase: "running_agents",
    status: "agent_council_active",
    progress: 38,
    message: "Activating AI agent council and synchronizing forensic roles.",
    durationMs: 640,
  },
  {
    phase: "reconstructing_failure_timeline",
    apiPhase: "reconstructing_timeline",
    status: "timeline_reconstruction",
    progress: 54,
    message: "Reconstructing the degradation timeline from commit and architecture signals.",
    durationMs: 700,
  },
  {
    phase: "predicting_engineering_risks",
    apiPhase: "predicting_failures",
    status: "risk_projection",
    progress: 70,
    message: "Projecting engineering risks, vulnerable systems, and failure propagation.",
    durationMs: 680,
  },
  {
    phase: "running_contradiction_analysis",
    apiPhase: "running_agents",
    status: "contradiction_debate",
    progress: 84,
    message: "Running contradiction analysis across competing agent theories.",
    durationMs: 560,
  },
  {
    phase: "generating_forensic_verdict",
    apiPhase: "synthesizing_verdict",
    status: "verdict_synthesis",
    progress: 94,
    message: "Generating final forensic verdict and remediation-ready intelligence.",
    durationMs: 520,
  },
];

const initialState: InvestigationControllerState = {
  loading: false,
  loadingState: "idle",
  progress: 0,
  phase: "awaiting_input",
  status: "offline",
  data: null,
  error: null,
  phaseHistory: [],
  retryCount: 0,
};

export function useInvestigation(
  options: InvestigationControllerOptions = {},
): InvestigationControllerReturn {
  const endpoint = options.endpoint ?? DEFAULT_ENDPOINT;
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const minimumPhaseDurationMs =
    options.minimumPhaseDurationMs ?? DEFAULT_PHASE_DURATION_MS;
  const enableMockFallback = options.enableMockFallback ?? true;
  const [state, setState] = useState<InvestigationControllerState>(initialState);
  const abortRef = useRef<AbortController | null>(null);
  const progressTimerRef = useRef<BrowserInterval | null>(null);
  const phaseTimerRef = useRef<BrowserTimeout | null>(null);
  const lastInputRef = useRef<StartInvestigationInput | undefined>(undefined);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      clearTimers(progressTimerRef, phaseTimerRef);
      abortRef.current?.abort();
    };
  }, []);

  const setSafeState = useCallback(
    (updater: React.SetStateAction<InvestigationControllerState>) => {
      if (!mountedRef.current) {
        return;
      }

      setState(updater);
    },
    [],
  );

  const updatePhase = useCallback(
    (
      phase: CinematicInvestigationPhase,
      progress = phaseProgress(phase),
      message = phaseMessage(phase),
    ) => {
      const status = phaseStatus(phase);

      setSafeState((current) => ({
        ...current,
        phase,
        status,
        progress: Math.max(current.progress, clampProgress(progress)),
        phaseHistory: [
          ...current.phaseHistory,
          {
            phase,
            status,
            progress: clampProgress(progress),
            message,
            timestamp: new Date().toISOString(),
          },
        ].slice(-24),
      }));
    },
    [setSafeState],
  );

  const simulateProgress = useCallback(
    (targetProgress = 92) => {
      clearProgressTimer(progressTimerRef);
      progressTimerRef.current = window.setInterval(() => {
        setSafeState((current) => {
          if (!current.loading || current.progress >= targetProgress) {
            clearProgressTimer(progressTimerRef);
            return current;
          }

          const pressure = current.progress < 35 ? 2.8 : current.progress < 70 ? 1.7 : 0.7;
          const pulse = Math.max(0.3, pressure - Math.random() * 0.9);

          return {
            ...current,
            progress: clampProgress(current.progress + pulse),
          };
        });
      }, PROGRESS_TICK_MS);
    },
    [setSafeState],
  );

  const resetInvestigation = useCallback(() => {
    clearTimers(progressTimerRef, phaseTimerRef);
    abortRef.current?.abort();
    abortRef.current = null;
    lastInputRef.current = undefined;
    setSafeState(initialState);
  }, [setSafeState]);

  const startInvestigation = useCallback(
    async (input: StartInvestigationInput = {}) => {
      lastInputRef.current = input;
      clearTimers(progressTimerRef, phaseTimerRef);
      abortRef.current?.abort();

      const abortController = new AbortController();
      abortRef.current = abortController;

      setSafeState((current) => ({
        ...initialState,
        loading: true,
        loadingState: "loading",
        status: "initializing",
        retryCount: current.retryCount,
      }));

      simulateProgress(91);

      try {
        const phaseFlow = runPhaseSequence(updatePhase, minimumPhaseDurationMs, phaseTimerRef);
        const payload = await normalizeApiPayload(input);
        const apiResponsePromise = postInvestigationRequest(
          endpoint,
          payload,
          timeoutMs,
          abortController,
        );
        const [apiResponse] = await Promise.all([apiResponsePromise, phaseFlow]);
        const data = normalizeInvestigationResponse(apiResponse, false);

        clearTimers(progressTimerRef, phaseTimerRef);
        updatePhase(
          "investigation_complete",
          100,
          "Investigation complete. Forensic verdict sealed and intelligence stabilized.",
        );
        setSafeState((current) => ({
          ...current,
          loading: false,
          loadingState: "success",
          progress: 100,
          phase: "investigation_complete",
          status: resolveCompletionStatus(data),
          data,
          error: null,
        }));

        if (options.autoResetAbortController ?? true) {
          abortRef.current = null;
        }

        return data;
      } catch (error) {
        clearTimers(progressTimerRef, phaseTimerRef);

        if (isAbortError(error)) {
          const message = "Investigation aborted before forensic intelligence stabilized.";
          updatePhase("investigation_failed", 100, message);
          setSafeState((current) => ({
            ...current,
            loading: false,
            loadingState: "error",
            phase: "investigation_failed",
            status: "degraded",
            error: message,
          }));
          throw new Error(message);
        }

        const message = error instanceof Error ? error.message : "Investigation failed.";

        if (!enableMockFallback) {
          updatePhase("investigation_failed", 100, message);
          setSafeState((current) => ({
            ...current,
            loading: false,
            loadingState: "error",
            progress: 100,
            phase: "investigation_failed",
            status: "critical",
            error: message,
          }));
          throw error;
        }

        const fallbackData = normalizeInvestigationResponse(
          generateMockInvestigationResponse(message),
          true,
        );

        updatePhase(
          "investigation_complete",
          100,
          "Fallback intelligence activated. Demo-grade forensic verdict preserved.",
        );
        setSafeState((current) => ({
          ...current,
          loading: false,
          loadingState: "success",
          progress: 100,
          phase: "investigation_complete",
          status: "fallback_mode",
          data: fallbackData,
          error: message,
        }));

        return fallbackData;
      }
    },
    [
      enableMockFallback,
      endpoint,
      minimumPhaseDurationMs,
      options.autoResetAbortController,
      setSafeState,
      simulateProgress,
      timeoutMs,
      updatePhase,
    ],
  );

  const retryInvestigation = useCallback(async () => {
    if (!lastInputRef.current) {
      return null;
    }

    setSafeState((current) => ({
      ...current,
      retryCount: current.retryCount + 1,
    }));

    return startInvestigation(lastInputRef.current);
  }, [setSafeState, startInvestigation]);

  return useMemo(
    () => ({
      ...state,
      startInvestigation,
      resetInvestigation,
      retryInvestigation,
      updatePhase,
      simulateProgress,
    }),
    [
      resetInvestigation,
      retryInvestigation,
      simulateProgress,
      startInvestigation,
      state,
      updatePhase,
    ],
  );
}

async function normalizeApiPayload(
  input: StartInvestigationInput,
): Promise<NormalizedApiPayload> {
  const githubUrl = input.githubUrl?.trim();
  const file = input.file ?? input.files?.find((candidate) => candidate.file)?.file;
  const uploadedFiles = await normalizeFiles(input.files, file);
  const request: AnalyzeRequest = {
    repositoryUrl: input.repositoryUrl ?? input.repoUrl ?? input.url ?? githubUrl,
    repoUrl: input.repoUrl,
    url: input.url,
    codeContent: input.codeContent,
    uploadedCode: input.uploadedCode,
    content: input.content,
    mockProjectStructure:
      input.mockProjectStructure ?? input.repositoryIntelligence ?? input.uploadedProjectMetadata,
    projectStructure: input.projectStructure,
    files: uploadedFiles.length > 0 ? uploadedFiles : undefined,
    provider: input.forceMockFallback ? "mock" : input.provider,
    model: input.model,
    metadata: {
      ...input.metadata,
      uploadedProjectMetadata: input.uploadedProjectMetadata,
      source: inferInputSource(input),
    },
  };

  return {
    request,
    hasMultipartFile: Boolean(file),
    file: file ?? undefined,
  };
}

async function normalizeFiles(
  files?: InvestigationFileInput[],
  fallbackFile?: File | null,
): Promise<AnalyzeFileInput[]> {
  const explicitFiles = files ?? [];
  const normalized = await Promise.all(
    explicitFiles.map(async (fileInput, index): Promise<AnalyzeFileInput> => {
      if (fileInput.file) {
        return {
          path: fileInput.path ?? fileInput.file.name,
          name: fileInput.name ?? fileInput.file.name,
          content: fileInput.content ?? (await readFileSafely(fileInput.file)),
          language: fileInput.language,
          sizeBytes: fileInput.sizeBytes ?? fileInput.file.size,
        };
      }

      return {
        path: fileInput.path ?? fileInput.name ?? `uploaded-file-${index + 1}.txt`,
        name: fileInput.name,
        content: fileInput.content,
        language: fileInput.language,
        sizeBytes: fileInput.sizeBytes,
      };
    }),
  );

  if (normalized.length === 0 && fallbackFile) {
    return [
      {
        path: fallbackFile.name,
        name: fallbackFile.name,
        content: await readFileSafely(fallbackFile),
        sizeBytes: fallbackFile.size,
      },
    ];
  }

  return normalized;
}

async function postInvestigationRequest(
  endpoint: string,
  payload: NormalizedApiPayload,
  timeoutMs: number,
  abortController: AbortController,
): Promise<unknown> {
  const timeoutId = window.setTimeout(() => abortController.abort(), timeoutMs);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      body: payload.hasMultipartFile ? toFormData(payload) : JSON.stringify(payload.request),
      headers: payload.hasMultipartFile
        ? undefined
        : {
            "Content-Type": "application/json",
          },
      signal: abortController.signal,
    });

    const contentType = response.headers.get("content-type") ?? "";
    const body = contentType.includes("application/json")
      ? ((await response.json()) as unknown)
      : await response.text();

    if (!response.ok) {
      const message = extractErrorMessage(body) ?? `Investigation API failed with HTTP ${response.status}.`;
      throw new Error(message);
    }

    return body;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

function toFormData(payload: NormalizedApiPayload): FormData {
  const formData = new FormData();
  const request = payload.request;

  if (payload.file) {
    formData.set("file", payload.file);
  }

  appendFormValue(formData, "repositoryUrl", request.repositoryUrl);
  appendFormValue(formData, "repoUrl", request.repoUrl);
  appendFormValue(formData, "url", request.url);
  appendFormValue(formData, "codeContent", request.codeContent);
  appendFormValue(formData, "uploadedCode", request.uploadedCode);
  appendFormValue(formData, "content", request.content);
  appendFormValue(formData, "provider", request.provider);
  appendFormValue(formData, "model", request.model);

  if (request.mockProjectStructure) {
    formData.set("mockProjectStructure", JSON.stringify(request.mockProjectStructure));
  }

  if (request.projectStructure) {
    formData.set("projectStructure", JSON.stringify(request.projectStructure));
  }

  if (request.files) {
    formData.set("files", JSON.stringify(request.files));
  }

  if (request.metadata) {
    formData.set("metadata", JSON.stringify(request.metadata));
  }

  return formData;
}

function normalizeInvestigationResponse(
  response: unknown,
  usedFallback: boolean,
): InvestigationControllerData {
  if (isAnalyzeResponse(response)) {
    const maybeArchitecture = readRecord(
      response as unknown as Record<string, unknown>,
      "architecture",
    );

    return {
      ...response,
      architectureReport:
        response.architectureReport ??
        (maybeArchitecture as ArchitectureReport | undefined) ??
        legacyToAnalyzeResponse(generateMockInvestigationResponse("Missing architecture report."))
          .architectureReport,
      systemStatus: response.systemStatus ?? statusFromRisk(response.riskMetrics.severity),
      investigationPhase: response.investigationPhase ?? "complete",
      raw: response,
      usedFallback,
      generatedAt: new Date().toISOString(),
    };
  }

  if (isLegacyAnalyzeResponse(response)) {
    const normalized = legacyToAnalyzeResponse(response);

    return {
      ...normalized,
      raw: response,
      usedFallback,
      generatedAt: new Date().toISOString(),
    };
  }

  return {
    ...legacyToAnalyzeResponse(generateMockInvestigationResponse("Malformed API response.")),
    raw: response,
    usedFallback: true,
    generatedAt: new Date().toISOString(),
  };
}

function legacyToAnalyzeResponse(response: LegacyAnalyzeResponse): AnalyzeResponse {
  const severity = legacySeverityToRisk(response.riskScore.severityLevel);
  const riskMetrics: RiskOverview = {
    riskScore: response.riskScore.overallRisk,
    stabilityScore: response.riskScore.stabilityScore,
    integrityScore: clampProgress(100 - response.riskScore.overallRisk + 20),
    projectedFailureRate: response.predictedFailures[0]?.probability ?? response.riskScore.overallRisk,
    severity,
    engineeringHealth: response.riskScore.engineeringHealth,
    metrics: [
      {
        id: "risk-overall",
        key: "risk_score",
        label: "Risk Score",
        value: response.riskScore.overallRisk,
        severity,
      },
      {
        id: "risk-stability",
        key: "stability_score",
        label: "Stability Score",
        value: response.riskScore.stabilityScore,
        severity: statusRiskToSeverity(100 - response.riskScore.stabilityScore),
      },
    ],
    summary: response.summary.detectedInstability,
    lastCalculatedAt: new Date().toISOString(),
  };
  const architectureReport: ArchitectureReport = {
    detectedServices: response.architecture.detectedServices,
    nodes: response.architecture.detectedServices.map((service, index) => ({
      id: `legacy-node-${index + 1}`,
      name: service,
      type: inferArchitectureNodeType(service),
      severity: index === 0 ? severity : "medium",
      healthScore: clampProgress(82 - index * 6),
    })),
    connections: [],
    dependencies: response.architecture.dependencyConcerns,
    duplicatedModules: response.architecture.duplicatedModules,
    suspiciousPatterns: response.architecture.suspiciousPatterns,
    architectureDrift: response.summary.architecturalConcerns,
    frontendStructure: response.architecture.frontendStructure,
    backendStructure: response.architecture.backendStructure,
    dependencyConcerns: response.architecture.dependencyConcerns,
    summary: response.summary.projectOverview,
  };
  const predictedFailures: PredictedFailure[] = response.predictedFailures.map((failure, index) => ({
    id: `legacy-failure-${index + 1}`,
    title: failure.title,
    probability: failure.probability,
    severity: failure.severity,
    description: failure.description,
    trigger: failure.trigger,
  }));
  const verdict: ForensicVerdict = {
    severity,
    verdict: response.verdict.architecturalVerdict,
    rootCause: response.verdict.rootCause,
    detectedRisks: [
      ...response.architecture.suspiciousPatterns,
      ...response.architecture.duplicatedModules,
    ],
    predictedFailures,
    engineeringCollapseSummary: response.verdict.engineeringCollapseExplanation,
    finalRecommendations: [
      {
        id: "legacy-rec-auth",
        title: "Stabilize forensic control plane",
        description: response.verdict.architecturalVerdict,
        priority: severity === "critical" ? "urgent" : "high",
        ownerHint: "Engineering command",
      },
    ],
    futureRisks: response.verdict.futureRisks,
    scalingWarnings: response.verdict.scalingWarnings,
    architecturalVerdict: response.verdict.architecturalVerdict,
    confidence: 86,
    generatedAt: new Date().toISOString(),
  };

  return {
    summary: response.summary,
    riskMetrics,
    architectureReport,
    timeline: response.timeline.map((event, index) => ({
      id: `legacy-timeline-${index + 1}`,
      title: event.title,
      timestamp: event.timestamp,
      severity: event.severity,
      description: event.description,
    })),
    agents: response.agents.map((agent, index): AgentData => ({
      id: `legacy-agent-${index + 1}`,
      role: displayRoleToAgentRole(agent.role),
      displayName: agent.role,
      title: agent.role,
      status: agent.status.toLowerCase() === "synthesized" ? "synthesized" : "analyzing",
      confidence: agent.confidence,
      message: agent.message,
      evidence: agent.evidence.map((item, evidenceIndex) => ({
        id: `legacy-agent-${index + 1}-evidence-${evidenceIndex + 1}`,
        label: item,
        severity,
        confidence: agent.confidence,
      })),
    })),
    verdict,
    predictedFailures,
    systemStatus: statusFromRisk(severity),
    investigationPhase: "complete",
  };
}

function generateMockInvestigationResponse(reason: string): LegacyAnalyzeResponse {
  return {
    summary: {
      projectOverview:
        "GHOST TRACE activated fallback intelligence and reconstructed a demo-grade repository threat scene.",
      detectedInstability:
        "Live investigation telemetry failed, but fallback analysis preserved the likely collapse chain: duplicated auth, fragmented validation, dependency volatility, and retry pressure.",
      systemCondition:
        "DEGRADED: investigation continues in cinematic fallback mode while API telemetry recovers.",
      architecturalConcerns: [
        "Authentication authority may be duplicated across middleware and worker paths.",
        "Validation boundaries require confirmation before replay traffic is trusted.",
        "Dependency and retry behavior need release-gate review.",
      ],
    },
    riskScore: {
      overallRisk: 84,
      stabilityScore: 39,
      severityLevel: "HIGH",
      engineeringHealth:
        "Recoverable but unstable; immediate recovery command should verify trust and retry boundaries.",
    },
    architecture: {
      detectedServices: ["Auth Service", "API Gateway", "Queue Workers", "Data Layer"],
      frontendStructure: "Frontend structure unavailable during fallback mode.",
      backendStructure: "Backend inferred from auth, API, queue, and data-layer pressure.",
      dependencyConcerns: ["Runtime parity requires inspection after API recovery."],
      duplicatedModules: ["auth authority appears duplicated", "validation logic appears fragmented"],
      suspiciousPatterns: ["fallback mode activated", reason],
    },
    timeline: [
      {
        title: "Fallback Evidence Channel Opened",
        timestamp: "T+00:00:11",
        severity: "MODERATE",
        description: "The frontend controller preserved the investigation flow after API failure.",
      },
      {
        title: "Control Boundary Risk Reconstructed",
        timestamp: "T+00:03:42",
        severity: "HIGH",
        description: "Fallback intelligence identified auth and validation as primary recovery targets.",
      },
      {
        title: "Verdict Stabilized",
        timestamp: "T+00:07:19",
        severity: "HIGH",
        description: "Demo-grade forensic verdict generated to keep the war room operational.",
      },
    ],
    agents: [
      {
        role: "FORENSIC ANALYST",
        confidence: 82,
        message:
          "API telemetry failed, but the fallback chain remains plausible: drift, duplication, retry pressure, then instability.",
        evidence: ["fallback mode", reason],
        status: "SYNTHESIZED",
      },
    ],
    verdict: {
      rootCause:
        "The investigation controller could not stabilize live API intelligence and switched to fallback mode.",
      engineeringCollapseExplanation:
        "Fallback intelligence preserves a believable recovery path until live analysis returns.",
      futureRisks: ["False confidence if fallback output is treated as live evidence."],
      scalingWarnings: ["Retry and queue pressure require live confirmation."],
      architecturalVerdict:
        "Do not ship high-risk architecture changes until live investigation telemetry recovers.",
    },
    predictedFailures: [
      {
        title: "Fallback Telemetry Blind Spot",
        probability: 78,
        severity: "HIGH",
        description:
          "The next investigation may miss repository-specific evidence if API telemetry remains unavailable.",
        trigger: "Repeated API failure or malformed investigation response",
      },
    ],
  };
}

function runPhaseSequence(
  updatePhase: (
    phase: CinematicInvestigationPhase,
    progress?: number,
    message?: string,
  ) => void,
  minimumPhaseDurationMs: number,
  timerRef: React.MutableRefObject<BrowserTimeout | null>,
): Promise<void> {
  return INVESTIGATION_PHASES.reduce(
    (chain, definition) =>
      chain.then(
        () =>
          new Promise<void>((resolve) => {
            updatePhase(definition.phase, definition.progress, definition.message);
            timerRef.current = window.setTimeout(
              resolve,
              Math.max(definition.durationMs, minimumPhaseDurationMs),
            );
          }),
      ),
    Promise.resolve(),
  );
}

function phaseProgress(phase: CinematicInvestigationPhase): number {
  return INVESTIGATION_PHASES.find((definition) => definition.phase === phase)?.progress ?? 0;
}

function phaseMessage(phase: CinematicInvestigationPhase): string {
  return (
    INVESTIGATION_PHASES.find((definition) => definition.phase === phase)?.message ??
    "Forensic investigation state updated."
  );
}

function phaseStatus(phase: CinematicInvestigationPhase): InvestigationStatus {
  if (phase === "awaiting_input") {
    return "offline";
  }

  if (phase === "investigation_complete") {
    return "online";
  }

  if (phase === "investigation_failed") {
    return "critical";
  }

  return (
    INVESTIGATION_PHASES.find((definition) => definition.phase === phase)?.status ??
    "investigating"
  );
}

function inferInputSource(input: StartInvestigationInput): string {
  if (input.githubUrl || input.repositoryUrl || input.repoUrl || input.url) {
    return input.file ? "hybrid" : "github";
  }

  if (input.file || input.files?.length) {
    return "uploaded-project";
  }

  if (input.repositoryIntelligence || input.mockProjectStructure || input.projectStructure) {
    return "repository-intelligence";
  }

  return "manual";
}

async function readFileSafely(file: File): Promise<string> {
  try {
    if (file.size > 2_500_000) {
      return `FILE: ${file.name}\nBinary or large evidence package staged for server-side forensic ingestion. Size: ${file.size} bytes.`;
    }

    return await file.text();
  } catch {
    return `FILE: ${file.name}\nUnable to read file content in browser; metadata preserved for server analysis.`;
  }
}

function appendFormValue(formData: FormData, key: string, value: unknown): void {
  if (typeof value === "string" && value.trim()) {
    formData.set(key, value);
  }
}

function extractErrorMessage(body: unknown): string | undefined {
  if (typeof body === "string") {
    return body.trim() || undefined;
  }

  if (isRecord(body)) {
    const message = body.message ?? body.error;
    return typeof message === "string" ? message : undefined;
  }

  return undefined;
}

function resolveCompletionStatus(data: InvestigationControllerData): InvestigationStatus {
  if (data.usedFallback) {
    return "fallback_mode";
  }

  return data.systemStatus ?? statusFromRisk(data.riskMetrics.severity);
}

function statusFromRisk(severity: RiskSeverity): SystemStatus {
  if (severity === "critical") {
    return "critical";
  }

  if (severity === "high") {
    return "warning";
  }

  return "online";
}

function statusRiskToSeverity(score: number): RiskSeverity {
  if (score >= 85) {
    return "critical";
  }

  if (score >= 68) {
    return "high";
  }

  if (score >= 42) {
    return "medium";
  }

  return "low";
}

function legacySeverityToRisk(severity: ApiSeverityLevel): RiskSeverity {
  if (severity === "CRITICAL") {
    return "critical";
  }

  if (severity === "HIGH") {
    return "high";
  }

  if (severity === "MODERATE") {
    return "medium";
  }

  return "low";
}

function inferArchitectureNodeType(service: string): ArchitectureReport["nodes"][number]["type"] {
  const normalized = service.toLowerCase();

  if (normalized.includes("auth")) {
    return "auth";
  }

  if (normalized.includes("api")) {
    return "api";
  }

  if (normalized.includes("queue")) {
    return "queue";
  }

  if (normalized.includes("worker")) {
    return "worker";
  }

  if (normalized.includes("data") || normalized.includes("database")) {
    return "database";
  }

  return "service";
}

function displayRoleToAgentRole(role: AgentData["displayName"]): AgentData["role"] {
  if (role === "FORENSIC ANALYST") {
    return "FORENSIC_ANALYST";
  }

  if (role === "SECURITY INVESTIGATOR") {
    return "SECURITY_INVESTIGATOR";
  }

  if (role === "FAILURE PREDICTOR") {
    return "FAILURE_PREDICTOR";
  }

  if (role === "TIMELINE RECONSTRUCTOR") {
    return "TIMELINE_RECONSTRUCTOR";
  }

  return "ARCHITECT";
}

function isAnalyzeResponse(value: unknown): value is AnalyzeResponse {
  return (
    isRecord(value) &&
    isRecord(value.summary) &&
    isRecord(value.riskMetrics) &&
    Array.isArray(value.timeline) &&
    Array.isArray(value.agents) &&
    isRecord(value.verdict)
  );
}

function isLegacyAnalyzeResponse(value: unknown): value is LegacyAnalyzeResponse {
  return (
    isRecord(value) &&
    isRecord(value.summary) &&
    isRecord(value.riskScore) &&
    isRecord(value.architecture) &&
    Array.isArray(value.timeline) &&
    Array.isArray(value.agents) &&
    isRecord(value.verdict)
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readRecord(
  value: Record<string, unknown>,
  key: string,
): Record<string, unknown> | undefined {
  const candidate = value[key];
  return isRecord(candidate) ? candidate : undefined;
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

function clampProgress(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(value)));
}

function clearTimers(
  progressTimerRef: React.MutableRefObject<BrowserInterval | null>,
  phaseTimerRef: React.MutableRefObject<BrowserTimeout | null>,
): void {
  clearProgressTimer(progressTimerRef);

  if (phaseTimerRef.current) {
    window.clearTimeout(phaseTimerRef.current);
    phaseTimerRef.current = null;
  }
}

function clearProgressTimer(
  progressTimerRef: React.MutableRefObject<BrowserInterval | null>,
): void {
  if (progressTimerRef.current) {
    window.clearInterval(progressTimerRef.current);
    progressTimerRef.current = null;
  }
}

export default useInvestigation;

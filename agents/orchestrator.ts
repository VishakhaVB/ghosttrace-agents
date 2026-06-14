import { contradiction } from "@/agents/contradiction";
import { forensic } from "@/agents/forensic";
import { historian } from "@/agents/historian";
import { remediation } from "@/agents/remediation";
import { risk } from "@/agents/risk";
import { gemini } from "@/lib/gemini";
import { mockAnalyzeResponse } from "@/lib/mockData";
import { parser } from "@/lib/parser";
import type {
  AgentData,
  AgentEvidence,
  AgentMessage,
  AgentRole,
  AgentStatus,
  AnalyzeRequest,
  ArchitectureConnection,
  ArchitectureNode,
  ArchitectureNodeType,
  ArchitectureReport,
  ForensicVerdict,
  InvestigationPhase,
  InvestigationSummary,
  PredictedFailure,
  Recommendation,
  RiskMetric,
  RiskOverview,
  RiskSeverity,
  SystemStatus,
  TimelineEvent,
} from "@/types";

type SourceType = "repository-url" | "uploaded-code" | "mock-structure" | "unknown";

export interface OrchestratorOptions {
  provider?: AnalyzeRequest["provider"];
  model?: string;
  timeoutMs?: number;
  forceMock?: boolean;
}

export interface InvestigationPhaseSnapshot {
  phase: InvestigationPhase;
  status: SystemStatus;
  progress: number;
  detail: string;
  timestamp: string;
}

export interface RepositoryFile {
  path: string;
  content: string;
  language?: string;
  sizeBytes?: number;
}

export interface RepositoryIntelligence {
  sourceType: SourceType;
  repositoryUrl?: string;
  fileCount: number;
  files: RepositoryFile[];
  sampledPaths: string[];
  codeExcerpt: string;
  detectedFrameworks: string[];
  detectedServices: string[];
  dependencies: string[];
  dependencySignals: string[];
  duplicatedModules: string[];
  suspiciousPatterns: string[];
  architectureDrift: string[];
  securitySignals: string[];
  scalingSignals: string[];
  metadata: {
    parsedAt: string;
    parserMode: "module" | "local" | "fallback";
    contentFingerprint: string;
  };
}

export interface AgentContradiction {
  id: string;
  challenger: AgentRole;
  target: AgentRole;
  topic: string;
  claim: string;
  counterClaim: string;
  evidenceIds: string[];
  severity: RiskSeverity;
  confidence: number;
}

export interface RemediationPlan {
  summary: string;
  recommendations: Recommendation[];
  releaseGateRequired: boolean;
  priorityOrder: string[];
}

export interface OrchestratedInvestigation {
  summary: InvestigationSummary;
  riskMetrics: RiskOverview;
  architecture: ArchitectureReport;
  timeline: TimelineEvent[];
  agents: AgentData[];
  contradictions: AgentContradiction[];
  remediation: RemediationPlan;
  verdict: ForensicVerdict;
  predictedFailures: PredictedFailure[];
  phases: InvestigationPhaseSnapshot[];
  systemStatus: SystemStatus;
  investigationPhase: InvestigationPhase;
  requestId: string;
  metadata: {
    generatedAt: string;
    usedFallback: boolean;
    confidence: number;
    sourceType: SourceType;
    provider: AnalyzeRequest["provider"];
  };
}

type OptionalModule = Record<string, unknown>;
type OptionalModuleResult = Record<string, unknown> | undefined;

const DEFAULT_TIMEOUT_MS = 8_500;
const MAX_SAMPLED_PATHS = 80;

const AGENT_CONFIG: Array<{
  role: AgentRole;
  displayName: AgentData["displayName"];
  title: string;
  signal: AgentMessage["signalType"];
}> = [
  {
    role: "ARCHITECT",
    displayName: "ARCHITECT",
    title: "System topology arbitrator",
    signal: "topology",
  },
  {
    role: "FORENSIC_ANALYST",
    displayName: "FORENSIC ANALYST",
    title: "Root-cause evidence engine",
    signal: "evidence",
  },
  {
    role: "SECURITY_INVESTIGATOR",
    displayName: "SECURITY INVESTIGATOR",
    title: "Threat boundary examiner",
    signal: "security",
  },
  {
    role: "FAILURE_PREDICTOR",
    displayName: "FAILURE PREDICTOR",
    title: "Collapse simulation model",
    signal: "prediction",
  },
  {
    role: "TIMELINE_RECONSTRUCTOR",
    displayName: "TIMELINE RECONSTRUCTOR",
    title: "Incident chronology synthesizer",
    signal: "timeline",
  },
];

export async function analyzeRepository(
  request: AnalyzeRequest = {},
  options: OrchestratorOptions = {},
): Promise<OrchestratedInvestigation> {
  const startedAt = now();
  const phases: InvestigationPhaseSnapshot[] = [];
  const provider = options.provider ?? request.provider ?? "openai";
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  const markPhase = (
    phase: InvestigationPhase,
    status: SystemStatus,
    progress: number,
    detail: string,
  ) => {
    phases.push({
      phase,
      status,
      progress,
      detail,
      timestamp: now(),
    });
  };

  try {
    markPhase(
      "ingesting_repository",
      "investigating",
      8,
      "Repository evidence accepted by master orchestrator.",
    );

    if (options.forceMock || provider === "mock") {
      return buildMockInvestigation(phases, startedAt, provider);
    }

    const intelligence = await withTimeout(
      parseRepositoryIntelligence(request),
      timeoutMs,
      "Repository parsing timed out.",
    );

    markPhase(
      "mapping_architecture",
      "investigating",
      24,
      "Architecture signals reconstructed from repository intelligence.",
    );
    const architecture = await withTimeout(
      analyzeArchitecture(intelligence),
      timeoutMs,
      "Architecture analysis timed out.",
    );

    markPhase(
      "reconstructing_timeline",
      "online",
      42,
      "Collapse chronology aligned against evidence graph.",
    );
    const timeline = await withTimeout(
      reconstructTimeline(intelligence, architecture),
      timeoutMs,
      "Timeline reconstruction timed out.",
    );

    markPhase(
      "predicting_failures",
      "warning",
      58,
      "Risk model projecting deployment, scaling, and security failure modes.",
    );
    const riskMetrics = await withTimeout(
      predictRisk(intelligence, architecture, timeline),
      timeoutMs,
      "Risk prediction timed out.",
    );

    const evidence = aggregateEvidence(intelligence, architecture, riskMetrics);

    markPhase(
      "running_agents",
      riskMetrics.severity === "critical" ? "critical" : "investigating",
      72,
      "Five-agent council debating evidence and root-cause priority.",
    );
    const agents = await withTimeout(
      runAgentCouncil(intelligence, architecture, timeline, riskMetrics, evidence),
      timeoutMs,
      "Agent council timed out.",
    );

    const contradictions = await withTimeout(
      generateContradictions(agents, riskMetrics, evidence),
      timeoutMs,
      "Contradiction synthesis timed out.",
    );

    markPhase(
      "synthesizing_verdict",
      riskMetrics.severity === "critical" ? "critical" : "warning",
      86,
      "Contradictions preserved and remediation plan routed into verdict synthesis.",
    );
    const remediationPlan = await withTimeout(
      produceRemediation(intelligence, architecture, riskMetrics, contradictions),
      timeoutMs,
      "Remediation generation timed out.",
    );

    const predictedFailures = buildPredictedFailures(
      intelligence,
      architecture,
      riskMetrics,
      evidence,
    );
    const summary = buildSummary(intelligence, architecture, riskMetrics);
    const verdict = await withTimeout(
      synthesizeVerdict({
        summary,
        intelligence,
        architecture,
        timeline,
        riskMetrics,
        agents,
        contradictions,
        remediationPlan,
        predictedFailures,
      }),
      timeoutMs,
      "Verdict synthesis timed out.",
    );

    markPhase(
      "complete",
      riskMetrics.severity === "critical" ? "critical" : "online",
      100,
      "Final forensic verdict sealed by master orchestrator.",
    );

    return {
      summary,
      riskMetrics,
      architecture,
      timeline,
      agents,
      contradictions,
      remediation: remediationPlan,
      verdict,
      predictedFailures,
      phases,
      systemStatus: riskMetrics.severity === "critical" ? "critical" : "warning",
      investigationPhase: "complete",
      requestId: createId("investigation", startedAt),
      metadata: {
        generatedAt: now(),
        usedFallback: false,
        confidence: verdict.confidence ?? average(agents.map((agent) => agent.confidence)),
        sourceType: intelligence.sourceType,
        provider,
      },
    };
  } catch (error) {
    markPhase(
      "failed",
      "degraded",
      100,
      error instanceof Error
        ? error.message
        : "Unknown orchestration fault; cinematic fallback activated.",
    );

    return buildMockInvestigation(phases, startedAt, provider);
  }
}

async function parseRepositoryIntelligence(
  request: AnalyzeRequest,
): Promise<RepositoryIntelligence> {
  const parserResult = await invokeOptionalModule(parser, [
    "parseRepository",
    "parse",
    "extractRepositoryIntelligence",
  ], request);

  if (parserResult) {
    const normalized = normalizeExternalIntelligence(parserResult, request);

    if (normalized) {
      return normalized;
    }
  }

  const repositoryUrl = request.repositoryUrl ?? request.repoUrl ?? request.url;
  const rawCode = request.codeContent ?? request.uploadedCode ?? request.content ?? "";
  const structure = request.mockProjectStructure ?? request.projectStructure;
  const files = normalizeFiles(request.files, rawCode, structure);
  const sampledPaths = files.map((file) => file.path).slice(0, MAX_SAMPLED_PATHS);
  const pathCorpus = sampledPaths.join("\n").toLowerCase();
  const contentCorpus = files
    .map((file) => `${file.path}\n${file.content}`)
    .join("\n")
    .toLowerCase()
    .slice(0, 140_000);
  const corpus = `${pathCorpus}\n${contentCorpus}`;

  return {
    sourceType: determineSourceType(repositoryUrl, rawCode, structure),
    repositoryUrl,
    fileCount: files.length,
    files,
    sampledPaths,
    codeExcerpt: files
      .map((file) => `FILE: ${file.path}\n${file.content}`)
      .join("\n\n")
      .slice(0, 22_000),
    detectedFrameworks: detectFrameworks(corpus),
    detectedServices: detectServices(corpus),
    dependencies: detectDependencies(corpus),
    dependencySignals: detectDependencySignals(corpus),
    duplicatedModules: detectDuplicatedModules(sampledPaths, corpus),
    suspiciousPatterns: detectSuspiciousPatterns(corpus),
    architectureDrift: detectArchitectureDrift(corpus, sampledPaths),
    securitySignals: detectSecuritySignals(corpus),
    scalingSignals: detectScalingSignals(corpus),
    metadata: {
      parsedAt: now(),
      parserMode: "local",
      contentFingerprint: fingerprint(`${repositoryUrl ?? ""}${corpus}`),
    },
  };
}

async function analyzeArchitecture(
  intelligence: RepositoryIntelligence,
): Promise<ArchitectureReport> {
  const external = await invokeOptionalModule(forensic, [
    "analyzeArchitecture",
    "analyze",
    "run",
  ], intelligence);

  if (external && Array.isArray(external.detectedServices)) {
    return normalizeArchitectureReport(external, intelligence);
  }

  const services = ensureList(intelligence.detectedServices, [
    "API Gateway",
    "Auth Service",
    "Data Layer",
    "Deployment Pipeline",
  ]);
  const nodes = services.map((service, index): ArchitectureNode => {
    const type = inferNodeType(service);
    const risky =
      containsAny(service, ["auth", "queue", "worker"]) ||
      intelligence.duplicatedModules.some((moduleName) =>
        moduleName.toLowerCase().includes(service.toLowerCase().split(" ")[0] ?? ""),
      );

    return {
      id: createId("node", service),
      name: service,
      type,
      service: slugify(service),
      path: findPathForService(service, intelligence.sampledPaths),
      severity: risky ? "high" : index > 4 ? "medium" : "low",
      healthScore: clampScore(risky ? 48 + index * 3 : 78 - index * 2),
      duplicated: containsAny(service, ["auth", "validation"]) || undefined,
      suspiciousPatterns: intelligence.suspiciousPatterns.slice(index, index + 2),
      metadata: {
        inferred: true,
        frameworks: intelligence.detectedFrameworks,
      },
    };
  });

  const connections = buildArchitectureConnections(nodes, intelligence);

  return {
    detectedServices: services,
    nodes,
    connections,
    dependencies: intelligence.dependencies,
    duplicatedModules: intelligence.duplicatedModules,
    suspiciousPatterns: intelligence.suspiciousPatterns,
    architectureDrift: intelligence.architectureDrift,
    frontendStructure: describeFrontend(intelligence),
    backendStructure: describeBackend(intelligence, services),
    dependencyConcerns: intelligence.dependencySignals,
    summary:
      "GHOST TRACE reconstructed the system as a set of cooperating service zones with concentrated instability around trust boundaries, dependency parity, and retry behavior.",
    metadata: {
      sourceType: intelligence.sourceType,
      nodeCount: nodes.length,
      connectionCount: connections.length,
      fingerprint: intelligence.metadata.contentFingerprint,
    },
  };
}

async function reconstructTimeline(
  intelligence: RepositoryIntelligence,
  architecture: ArchitectureReport,
): Promise<TimelineEvent[]> {
  const external = await invokeOptionalModule(historian, [
    "reconstructTimeline",
    "buildTimeline",
    "run",
  ], intelligence, architecture);

  if (external && Array.isArray(external.timeline)) {
    return normalizeTimelineEvents(external.timeline);
  }

  const events: TimelineEvent[] = [
    {
      id: "timeline-ingestion",
      timestamp: "T+00:00:42",
      severity: "medium",
      title: "Repository intelligence ingested",
      description:
        "The orchestrator stabilized source evidence and began reconstructing the software collapse corridor.",
      metadata: {
        source: intelligence.sourceType,
        confidence: 82,
        filePaths: intelligence.sampledPaths.slice(0, 4),
        tags: ["ingestion", "evidence"],
      },
    },
    {
      id: "timeline-architecture-drift",
      timestamp: "T+00:04:18",
      severity: severityFromCount(intelligence.architectureDrift.length, 1),
      title: "Architecture drift surfaced",
      description:
        firstOrFallback(
          intelligence.architectureDrift,
          "Service ownership and runtime call paths show signs of architectural drift.",
        ),
      metadata: {
        agentRole: "ARCHITECT",
        confidence: 88,
        affectedServices: architecture.detectedServices.slice(0, 5),
        tags: ["architecture", "drift"],
      },
    },
    {
      id: "timeline-duplication",
      timestamp: "T+00:08:44",
      severity: severityFromCount(intelligence.duplicatedModules.length, 1),
      title: "Duplicated authority detected",
      description:
        firstOrFallback(
          intelligence.duplicatedModules,
          "Potential duplicate modules were inferred across auth, validation, or configuration surfaces.",
        ),
      metadata: {
        agentRole: "FORENSIC_ANALYST",
        confidence: 86,
        tags: ["duplication", "root-cause"],
      },
    },
    {
      id: "timeline-security-boundary",
      timestamp: "T+00:13:26",
      severity: severityFromCount(intelligence.securitySignals.length, 1),
      title: "Trust boundary challenged",
      description:
        firstOrFallback(
          intelligence.securitySignals,
          "Security investigator could not prove uniform validation across internal ingress paths.",
        ),
      metadata: {
        agentRole: "SECURITY_INVESTIGATOR",
        confidence: 84,
        tags: ["security", "validation"],
      },
    },
    {
      id: "timeline-risk-projection",
      timestamp: "T+00:18:51",
      severity: severityFromCount(intelligence.scalingSignals.length, 1),
      title: "Future failure pressure projected",
      description:
        firstOrFallback(
          intelligence.scalingSignals,
          "Scaling pressure is inferred from retries, queues, timeouts, or deployment-sensitive runtime paths.",
        ),
      metadata: {
        agentRole: "FAILURE_PREDICTOR",
        confidence: 87,
        tags: ["prediction", "scaling"],
      },
    },
    {
      id: "timeline-verdict-lock",
      timestamp: "T+00:24:09",
      severity: "high",
      title: "Forensic sequence locked",
      description:
        "Timeline reconstruction converged on a layered collapse path: drift, duplication, dependency volatility, trust-boundary ambiguity, and runtime amplification.",
      metadata: {
        agentRole: "TIMELINE_RECONSTRUCTOR",
        confidence: 92,
        tags: ["verdict", "causality"],
      },
    },
  ];

  return events;
}

async function predictRisk(
  intelligence: RepositoryIntelligence,
  architecture: ArchitectureReport,
  timeline: TimelineEvent[],
): Promise<RiskOverview> {
  const external = await invokeOptionalModule(risk, [
    "predictRisk",
    "analyzeRisk",
    "run",
  ], intelligence, architecture, timeline);

  if (external && typeof external.riskScore === "number") {
    return normalizeRiskOverview(external);
  }

  const instability =
    intelligence.suspiciousPatterns.length * 7 +
    intelligence.duplicatedModules.length * 9 +
    intelligence.dependencySignals.length * 5 +
    intelligence.architectureDrift.length * 8 +
    intelligence.securitySignals.length * 7 +
    intelligence.scalingSignals.length * 8 +
    Math.max(0, architecture.detectedServices.length - 4) * 3;
  const riskScore = clampScore(38 + instability);
  const stabilityScore = clampScore(108 - riskScore);
  const integrityScore = clampScore(
    78 - intelligence.architectureDrift.length * 8 - intelligence.duplicatedModules.length * 5,
  );
  const projectedFailureRate = clampScore(
    riskScore - 8 + intelligence.scalingSignals.length * 6,
  );
  const severity = scoreToSeverity(riskScore);
  const metrics: RiskMetric[] = [
    {
      id: "risk-overall",
      key: "risk_score",
      label: "Risk Score",
      value: riskScore,
      severity,
      trend: riskScore > 82 ? "spiking" : "rising",
      description:
        "Composite risk derived from architecture drift, duplicated authority, dependency volatility, security exposure, and scaling pressure.",
    },
    {
      id: "risk-stability",
      key: "stability_score",
      label: "Stability Score",
      value: stabilityScore,
      severity: scoreToSeverity(100 - stabilityScore),
      trend: stabilityScore < 50 ? "falling" : "stable",
      description:
        "Runtime resilience estimate after accounting for drift, retries, and fragmented validation.",
    },
    {
      id: "risk-integrity",
      key: "integrity_score",
      label: "Architecture Integrity",
      value: integrityScore,
      severity: scoreToSeverity(100 - integrityScore),
      trend: integrityScore < 65 ? "falling" : "stable",
      description:
        "Measures whether service ownership and module boundaries still form a coherent engineering system.",
    },
    {
      id: "risk-failure-rate",
      key: "projected_failure_rate",
      label: "Projected Failure Rate",
      value: projectedFailureRate,
      severity: scoreToSeverity(projectedFailureRate),
      trend: projectedFailureRate > 75 ? "spiking" : "rising",
      description:
        "Release-window failure projection based on queue, retry, deployment, and dependency signals.",
    },
  ];

  return {
    riskScore,
    stabilityScore,
    integrityScore,
    projectedFailureRate,
    severity,
    engineeringHealth:
      severity === "critical"
        ? "Mission-critical systemic instability detected; release gate recommended."
        : severity === "high"
          ? "Elevated engineering instability with credible future failure paths."
          : "Recoverable engineering condition with monitored instability signals.",
    metrics,
    summary:
      "The risk model indicates that the system is being stressed by multiple coupled failure vectors rather than a single isolated defect.",
    lastCalculatedAt: now(),
  };
}

async function runAgentCouncil(
  intelligence: RepositoryIntelligence,
  architecture: ArchitectureReport,
  timeline: TimelineEvent[],
  riskMetrics: RiskOverview,
  evidence: AgentEvidence[],
): Promise<AgentData[]> {
  const aiDraft = await invokeOptionalAiCouncil(intelligence, architecture, riskMetrics);

  return AGENT_CONFIG.map((config, index) => {
    const selectedEvidence = selectEvidenceForRole(config.role, evidence);
    const confidence = clampScore(
      riskMetrics.riskScore +
        (config.role === "TIMELINE_RECONSTRUCTOR" ? 8 : 0) +
        (config.role === "SECURITY_INVESTIGATOR" ? -4 : 0) -
        index,
    );
    const status = agentStatusForRole(config.role, riskMetrics.severity);
    const message = aiDraft?.[config.role] ?? buildAgentMessage(
      config.role,
      intelligence,
      architecture,
      riskMetrics,
    );
    const timestamp = `T+00:${String(9 + index * 4).padStart(2, "0")}:${String(
      12 + index * 7,
    ).padStart(2, "0")}`;

    return {
      id: createId("agent", config.role),
      role: config.role,
      displayName: config.displayName,
      title: config.title,
      status,
      confidence,
      message,
      evidence: selectedEvidence,
      currentTask: taskForRole(config.role),
      disagreement: disagreementForRole(config.role, riskMetrics.severity),
      lastUpdated: now(),
      messages: [
        {
          id: createId("msg", config.role),
          agentRole: config.role,
          message,
          timestamp,
          signalType: config.signal,
          status,
          confidence,
          evidenceIds: selectedEvidence.map((item) => item.id),
          metadata: {
            timelineAnchor: timeline[index % timeline.length]?.id,
            architectureNodes: architecture.nodes.slice(0, 3).map((node) => node.id),
          },
        },
      ],
      metadata: {
        signal: `${config.role}_SIGNAL_LOCK`,
        debateWeight: index + 1,
      },
    };
  });
}

async function generateContradictions(
  agents: AgentData[],
  riskMetrics: RiskOverview,
  evidence: AgentEvidence[],
): Promise<AgentContradiction[]> {
  const external = await invokeOptionalModule(contradiction, [
    "generateContradictions",
    "debate",
    "run",
  ], agents, riskMetrics, evidence);

  if (external && Array.isArray(external.contradictions)) {
    return normalizeContradictions(external.contradictions);
  }

  const evidenceIds = evidence.slice(0, 4).map((item) => item.id);

  return [
    {
      id: "contradiction-architecture-vs-scale",
      challenger: "FAILURE_PREDICTOR",
      target: "ARCHITECT",
      topic: "Root-cause priority",
      claim:
        "Scaling guardrails must ship before topology repair because queue saturation can arrive inside one release window.",
      counterClaim:
        "The Architect argues scaling pressure is an amplifier; duplicated ownership remains the root defect.",
      evidenceIds,
      severity: riskMetrics.severity,
      confidence: clampScore(riskMetrics.riskScore - 3),
    },
    {
      id: "contradiction-security-vs-forensics",
      challenger: "SECURITY_INVESTIGATOR",
      target: "FORENSIC_ANALYST",
      topic: "Exposure framing",
      claim:
        "Security frames fragmented validation as an active trust-boundary exposure until proven deterministic.",
      counterClaim:
        "Forensics frames the same evidence as engineering drift that may not yet be adversarially exploitable.",
      evidenceIds,
      severity: riskMetrics.severity === "critical" ? "critical" : "high",
      confidence: clampScore(riskMetrics.riskScore - 7),
    },
  ];
}

async function produceRemediation(
  intelligence: RepositoryIntelligence,
  architecture: ArchitectureReport,
  riskMetrics: RiskOverview,
  contradictions: AgentContradiction[],
): Promise<RemediationPlan> {
  const external = await invokeOptionalModule(remediation, [
    "produceRemediation",
    "recommend",
    "run",
  ], intelligence, architecture, riskMetrics, contradictions);

  if (external && Array.isArray(external.recommendations)) {
    return normalizeRemediationPlan(external, riskMetrics);
  }

  const recommendations: Recommendation[] = [
    {
      id: "rec-release-gate",
      title: "Gate release until forensic invariants are restored",
      description:
        "Pause high-risk deployment paths until auth, validation, dependency parity, and retry behavior share enforceable contracts.",
      priority: riskMetrics.severity === "critical" ? "urgent" : "high",
      ownerHint: "Engineering leadership",
      relatedRiskIds: ["risk-overall", "risk-failure-rate"],
    },
    {
      id: "rec-collapse-auth",
      title: "Collapse duplicated trust authority",
      description:
        "Remove parallel authentication or validation modules and route every execution context through one canonical policy boundary.",
      priority: "urgent",
      ownerHint: "Security platform",
      relatedRiskIds: ["risk-stability", "risk-integrity"],
    },
    {
      id: "rec-runtime-parity",
      title: "Enforce runtime and dependency parity",
      description:
        "Lock worker, API, and frontend runtime dependencies under the same release discipline, then add drift checks to CI.",
      priority: "high",
      ownerHint: "Developer infrastructure",
      relatedRiskIds: ["risk-failure-rate"],
    },
    {
      id: "rec-retry-containment",
      title: "Install retry circuit breakers",
      description:
        "Attach idempotency verdicts, first-failure causality, and replay caps before queue pressure can convert a local defect into a cascade.",
      priority: "high",
      ownerHint: "Runtime reliability",
      relatedRiskIds: ["risk-failure-rate", "risk-overall"],
    },
  ];

  return {
    summary:
      "Remediation should prioritize control-plane correction before feature delivery: trust authority, validation contracts, dependency parity, and retry containment.",
    recommendations,
    releaseGateRequired: riskMetrics.riskScore >= 75,
    priorityOrder: recommendations.map((item) => item.id),
  };
}

function buildPredictedFailures(
  intelligence: RepositoryIntelligence,
  architecture: ArchitectureReport,
  riskMetrics: RiskOverview,
  evidence: AgentEvidence[],
): PredictedFailure[] {
  const serviceSlice = architecture.detectedServices.slice(0, 4);
  const evidenceIds = evidence.slice(0, 4).map((item) => item.id);

  return [
    {
      id: "failure-deployment-instability",
      title: "Deployment instability from dependency drift",
      probability: clampScore(riskMetrics.projectedFailureRate),
      severity: riskMetrics.severity,
      description:
        "A release can behave differently across API, worker, and UI runtimes if dependency and configuration parity remain unproven.",
      trigger: firstOrFallback(
        intelligence.dependencySignals,
        "Dependency upgrade, lockfile mismatch, or environment rotation",
      ),
      impactedServices: serviceSlice,
      evidenceIds,
    },
    {
      id: "failure-security-boundary",
      title: "Security vulnerability through fragmented validation",
      probability: clampScore(riskMetrics.riskScore - 9),
      severity: riskMetrics.severity === "critical" ? "CRITICAL" : "HIGH",
      description:
        "Internal ingress can inherit inconsistent validation or authentication decisions if duplicated authority is not removed.",
      trigger: firstOrFallback(
        intelligence.securitySignals,
        "Malformed event enters a less strict internal execution path",
      ),
      impactedServices: serviceSlice,
      evidenceIds,
    },
    {
      id: "failure-scaling-cascade",
      title: "Cascading failure under scaling pressure",
      probability: clampScore(riskMetrics.projectedFailureRate + 6),
      severity: riskMetrics.severity === "critical" ? "CRITICAL" : "HIGH",
      description:
        "Retries, queues, and slow dependencies can amplify localized latency into worker saturation and API degradation.",
      trigger: firstOrFallback(
        intelligence.scalingSignals,
        "Traffic spike coincides with retry amplification",
      ),
      impactedServices: serviceSlice,
      evidenceIds,
    },
  ];
}

function buildSummary(
  intelligence: RepositoryIntelligence,
  architecture: ArchitectureReport,
  riskMetrics: RiskOverview,
): InvestigationSummary {
  const source =
    intelligence.sourceType === "repository-url"
      ? `repository at ${intelligence.repositoryUrl}`
      : intelligence.sourceType.replace("-", " ");

  return {
    projectOverview: `GHOST TRACE ingested ${source} and reconstructed ${architecture.detectedServices.length} service zones across ${intelligence.fileCount} evidence files.`,
    detectedInstability:
      "The investigation found a layered instability pattern: architecture drift, duplicated module authority, dependency volatility, security ambiguity, and runtime amplification.",
    systemCondition:
      riskMetrics.severity === "critical"
        ? "CRITICAL: engineering collapse risk is active enough to justify release gating and immediate remediation."
        : riskMetrics.severity === "high"
          ? "HIGH RISK: system behavior is recoverable but unsafe under release-window pressure."
          : "MONITORED: the system remains stable, but forensic indicators require continued analysis.",
    architecturalConcerns: [
      ...architecture.architectureDrift.slice(0, 2),
      ...architecture.duplicatedModules.slice(0, 2),
      ...architecture.suspiciousPatterns.slice(0, 2),
    ].slice(0, 5),
  };
}

async function synthesizeVerdict(input: {
  summary: InvestigationSummary;
  intelligence: RepositoryIntelligence;
  architecture: ArchitectureReport;
  timeline: TimelineEvent[];
  riskMetrics: RiskOverview;
  agents: AgentData[];
  contradictions: AgentContradiction[];
  remediationPlan: RemediationPlan;
  predictedFailures: PredictedFailure[];
}): Promise<ForensicVerdict> {
  const rootCause = [
    firstOrFallback(
      input.architecture.architectureDrift,
      "Architecture drift weakened ownership boundaries.",
    ),
    firstOrFallback(
      input.architecture.duplicatedModules,
      "Duplicated modules created competing execution authority.",
    ),
    firstOrFallback(
      input.intelligence.dependencySignals,
      "Dependency and runtime parity could not be proven.",
    ),
  ].join(" ");
  const detectedRisks = uniqueCompact([
    ...input.architecture.duplicatedModules,
    ...input.architecture.suspiciousPatterns,
    ...input.intelligence.securitySignals,
    ...input.intelligence.scalingSignals,
  ]).slice(0, 8);

  return {
    severity: input.riskMetrics.severity,
    verdict:
      input.riskMetrics.severity === "critical"
        ? "GHOST TRACE VERDICT: SEV-1 systemic instability likely without intervention. The system remains recoverable, but only if engineering pauses long enough to restore canonical ownership, validation, dependency parity, and retry containment."
        : "GHOST TRACE VERDICT: engineering instability is credible and measurable. The system can recover if the identified forensic vectors are remediated before the next pressure event.",
    rootCause,
    detectedRisks,
    predictedFailures: input.predictedFailures,
    engineeringCollapseSummary:
      "The collapse path is not a single bug. It is a chain reaction created by drift, duplicated authority, dependency uncertainty, and runtime pressure. The agent council preserved disagreements because the first visible outage may not be the initiating defect.",
    finalRecommendations: input.remediationPlan.recommendations,
    futureRisks: input.predictedFailures.map((failure) => failure.description),
    scalingWarnings: input.intelligence.scalingSignals.length
      ? input.intelligence.scalingSignals
      : [
          "Retry pressure can hide the first failure behind repeated downstream symptoms.",
          "Autoscaling will not repair duplicated authority or fragmented validation.",
        ],
    architecturalVerdict:
      "Restore a single control plane for trust, validation, idempotency, dependencies, and service ownership before expanding feature surface.",
    confidence: clampScore(average(input.agents.map((agent) => agent.confidence))),
    generatedAt: now(),
  };
}

function buildMockInvestigation(
  phases: InvestigationPhaseSnapshot[],
  startedAt: string,
  provider: AnalyzeRequest["provider"],
): OrchestratedInvestigation {
  const recommendations = mockAnalyzeResponse.verdict.finalRecommendations;
  const contradictions: AgentContradiction[] = [
    {
      id: "mock-contradiction-architecture-scale",
      challenger: "FAILURE_PREDICTOR",
      target: "ARCHITECT",
      topic: "Immediate mitigation priority",
      claim:
        "Queue circuit breakers must ship before topology repair because worker exhaustion can arrive inside the next release window.",
      counterClaim:
        "The Architect maintains that queue saturation is downstream of architecture drift and duplicated authority.",
      evidenceIds: ["evidence-scaling-pressure", "evidence-topology-drift"],
      severity: "critical",
      confidence: 91,
    },
    {
      id: "mock-contradiction-security-forensic",
      challenger: "SECURITY_INVESTIGATOR",
      target: "FORENSIC_ANALYST",
      topic: "Security exposure severity",
      claim:
        "Validation fragmentation should be treated as active exposure until replay authorization is deterministic.",
      counterClaim:
        "Forensics agrees on severity but classifies the initiating cause as engineering drift, not adversarial traffic.",
      evidenceIds: ["evidence-auth-duplication", "evidence-validation-fragment"],
      severity: "critical",
      confidence: 89,
    },
  ];

  return {
    summary: mockAnalyzeResponse.summary,
    riskMetrics: mockAnalyzeResponse.riskMetrics,
    architecture: mockAnalyzeResponse.architectureReport,
    timeline: mockAnalyzeResponse.timeline,
    agents: mockAnalyzeResponse.agents,
    contradictions,
    remediation: {
      summary:
        "Fallback remediation preserves the cinematic investigation flow and keeps the interface fully functional while AI providers recover.",
      recommendations,
      releaseGateRequired: true,
      priorityOrder: recommendations.map((item) => item.id),
    },
    verdict: mockAnalyzeResponse.verdict,
    predictedFailures: mockAnalyzeResponse.predictedFailures,
    phases: [
      ...phases,
      {
        phase: "complete",
        status: "critical",
        progress: 100,
        detail: "Mock fallback intelligence sealed for uninterrupted war-room UI.",
        timestamp: now(),
      },
    ],
    systemStatus: "critical",
    investigationPhase: "complete",
    requestId: createId("fallback-investigation", startedAt),
    metadata: {
      generatedAt: now(),
      usedFallback: true,
      confidence: mockAnalyzeResponse.verdict.confidence ?? 93,
      sourceType: "mock-structure",
      provider,
    },
  };
}

async function invokeOptionalAiCouncil(
  intelligence: RepositoryIntelligence,
  architecture: ArchitectureReport,
  riskMetrics: RiskOverview,
): Promise<Partial<Record<AgentRole, string>> | undefined> {
  const external = await invokeOptionalModule(gemini, [
    "generateAgentCouncil",
    "generateInvestigation",
    "run",
  ], {
    intelligence,
    architecture,
    riskMetrics,
  });

  if (!external) {
    return undefined;
  }

  const messages = readRecord(external, "agentMessages");

  if (!messages) {
    return undefined;
  }

  return AGENT_CONFIG.reduce<Partial<Record<AgentRole, string>>>((acc, agent) => {
    const value = messages[agent.role];

    if (typeof value === "string") {
      acc[agent.role] = value;
    }

    return acc;
  }, {});
}

async function invokeOptionalModule(
  module: unknown,
  methodNames: string[],
  ...args: unknown[]
): Promise<OptionalModuleResult> {
  const candidate = asOptionalModule(module);

  if (!candidate) {
    return undefined;
  }

  for (const methodName of methodNames) {
    const method = candidate[methodName];

    if (typeof method === "function") {
      const result = await method(...args);
      return isRecord(result) ? result : undefined;
    }
  }

  return undefined;
}

function normalizeExternalIntelligence(
  value: Record<string, unknown>,
  request: AnalyzeRequest,
): RepositoryIntelligence | undefined {
  const files = Array.isArray(value.files)
    ? value.files.map((file, index) => normalizeUnknownFile(file, index))
    : undefined;

  if (!files) {
    return undefined;
  }

  const repositoryUrl = readString(value, "repositoryUrl") ?? request.repositoryUrl;

  return {
    sourceType: normalizeSourceType(readString(value, "sourceType")),
    repositoryUrl,
    fileCount: files.length,
    files,
    sampledPaths: readStringArray(value, "sampledPaths") ?? files.map((file) => file.path),
    codeExcerpt: readString(value, "codeExcerpt") ?? "",
    detectedFrameworks: readStringArray(value, "detectedFrameworks") ?? [],
    detectedServices: readStringArray(value, "detectedServices") ?? [],
    dependencies: readStringArray(value, "dependencies") ?? [],
    dependencySignals: readStringArray(value, "dependencySignals") ?? [],
    duplicatedModules: readStringArray(value, "duplicatedModules") ?? [],
    suspiciousPatterns: readStringArray(value, "suspiciousPatterns") ?? [],
    architectureDrift: readStringArray(value, "architectureDrift") ?? [],
    securitySignals: readStringArray(value, "securitySignals") ?? [],
    scalingSignals: readStringArray(value, "scalingSignals") ?? [],
    metadata: {
      parsedAt: now(),
      parserMode: "module",
      contentFingerprint: fingerprint(files.map((file) => file.path).join("|")),
    },
  };
}

function normalizeArchitectureReport(
  value: Record<string, unknown>,
  intelligence: RepositoryIntelligence,
): ArchitectureReport {
  return {
    detectedServices:
      readStringArray(value, "detectedServices") ?? intelligence.detectedServices,
    nodes: Array.isArray(value.nodes)
      ? value.nodes.map((node, index) => normalizeArchitectureNode(node, index))
      : [],
    connections: Array.isArray(value.connections)
      ? value.connections.map((connection, index) =>
          normalizeArchitectureConnection(connection, index),
        )
      : [],
    dependencies: readStringArray(value, "dependencies") ?? intelligence.dependencies,
    duplicatedModules:
      readStringArray(value, "duplicatedModules") ?? intelligence.duplicatedModules,
    suspiciousPatterns:
      readStringArray(value, "suspiciousPatterns") ?? intelligence.suspiciousPatterns,
    architectureDrift:
      readStringArray(value, "architectureDrift") ?? intelligence.architectureDrift,
    frontendStructure: readString(value, "frontendStructure"),
    backendStructure: readString(value, "backendStructure"),
    dependencyConcerns:
      readStringArray(value, "dependencyConcerns") ?? intelligence.dependencySignals,
    summary: readString(value, "summary"),
    metadata: isRecord(value.metadata) ? value.metadata : undefined,
  };
}

function normalizeRiskOverview(value: Record<string, unknown>): RiskOverview {
  const riskScore = clampScore(readNumber(value, "riskScore") ?? 72);
  const severity = normalizeRiskSeverity(readString(value, "severity")) ?? scoreToSeverity(riskScore);

  return {
    riskScore,
    stabilityScore: clampScore(readNumber(value, "stabilityScore") ?? 100 - riskScore),
    integrityScore: clampScore(readNumber(value, "integrityScore") ?? 65),
    projectedFailureRate: clampScore(readNumber(value, "projectedFailureRate") ?? riskScore),
    severity,
    engineeringHealth:
      readString(value, "engineeringHealth") ??
      "AI risk engine detected elevated instability.",
    metrics: Array.isArray(value.metrics)
      ? value.metrics.map((metric, index) => normalizeRiskMetric(metric, index))
      : [],
    summary: readString(value, "summary"),
    lastCalculatedAt: readString(value, "lastCalculatedAt") ?? now(),
  };
}

function normalizeTimelineEvents(value: unknown[]): TimelineEvent[] {
  return value.map((event, index) => {
    const record = isRecord(event) ? event : {};

    return {
      id: readString(record, "id") ?? createId("timeline", index),
      title: readString(record, "title") ?? "Forensic event reconstructed",
      timestamp: readString(record, "timestamp") ?? `T+00:${String(index).padStart(2, "0")}:00`,
      severity: normalizeRiskSeverity(readString(record, "severity")) ?? "high",
      description:
        readString(record, "description") ??
        "Timeline event supplied without description; orchestrator preserved sequence.",
      metadata: isRecord(record.metadata) ? record.metadata : undefined,
    };
  });
}

function normalizeContradictions(value: unknown[]): AgentContradiction[] {
  return value.map((item, index) => {
    const record = isRecord(item) ? item : {};

    return {
      id: readString(record, "id") ?? createId("contradiction", index),
      challenger: normalizeAgentRole(readString(record, "challenger")) ?? "SECURITY_INVESTIGATOR",
      target: normalizeAgentRole(readString(record, "target")) ?? "ARCHITECT",
      topic: readString(record, "topic") ?? "Agent disagreement",
      claim: readString(record, "claim") ?? "Agent challenged the current conclusion.",
      counterClaim:
        readString(record, "counterClaim") ??
        "Target agent retained the previous forensic interpretation.",
      evidenceIds: readStringArray(record, "evidenceIds") ?? [],
      severity: normalizeRiskSeverity(readString(record, "severity")) ?? "high",
      confidence: clampScore(readNumber(record, "confidence") ?? 82),
    };
  });
}

function normalizeRemediationPlan(
  value: Record<string, unknown>,
  riskMetrics: RiskOverview,
): RemediationPlan {
  return {
    summary:
      readString(value, "summary") ??
      "Remediation plan generated by external module and normalized by orchestrator.",
    recommendations: Array.isArray(value.recommendations)
      ? value.recommendations.map((recommendation, index) =>
          normalizeRecommendation(recommendation, index),
        )
      : [],
    releaseGateRequired:
      typeof value.releaseGateRequired === "boolean"
        ? value.releaseGateRequired
        : riskMetrics.riskScore >= 75,
    priorityOrder: readStringArray(value, "priorityOrder") ?? [],
  };
}

function normalizeFiles(
  files: AnalyzeRequest["files"],
  rawCode: string,
  structure: unknown,
): RepositoryFile[] {
  if (Array.isArray(files) && files.length > 0) {
    return files.map((file, index) => ({
      path: file.path ?? file.name ?? `uploaded-file-${index + 1}.txt`,
      content: file.content ?? "",
      language: file.language,
      sizeBytes: file.sizeBytes,
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
        "app/api/auth route duplicated with legacy-auth adapter, queue retry logic, package dependencies, deployment config, validation middleware, worker replay",
    },
  ];
}

function splitInlineProject(rawCode: string): RepositoryFile[] {
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

function flattenStructure(structure: unknown): RepositoryFile[] {
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

  return paths.slice(0, 160).map((path) => ({
    path,
    content: "",
  }));
}

function determineSourceType(
  repositoryUrl?: string,
  rawCode?: string,
  structure?: unknown,
): SourceType {
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
    includesAny(corpus, ["next", "app/", "route.ts"]) ? "Next.js" : "",
    corpus.includes("react") ? "React" : "",
    corpus.includes("tailwind") ? "Tailwind CSS" : "",
    corpus.includes("express") ? "Express" : "",
    corpus.includes("nestjs") ? "NestJS" : "",
    corpus.includes("fastapi") ? "FastAPI" : "",
    corpus.includes("django") ? "Django" : "",
    corpus.includes("prisma") ? "Prisma" : "",
    corpus.includes("vite") ? "Vite" : "",
  ]);
}

function detectServices(corpus: string) {
  return uniqueCompact([
    includesAny(corpus, ["frontend", "components/", "app/page", "react"])
      ? "Web Console"
      : "",
    includesAny(corpus, ["api/", "route.ts", "controller", "endpoint"])
      ? "API Gateway"
      : "",
    includesAny(corpus, ["auth", "session", "jwt", "oauth", "token"])
      ? "Auth Service"
      : "",
    includesAny(corpus, ["billing", "stripe", "invoice", "payment"])
      ? "Billing Service"
      : "",
    includesAny(corpus, ["queue", "worker", "job", "bullmq", "redis"])
      ? "Queue Workers"
      : "",
    includesAny(corpus, ["db", "database", "postgres", "mysql", "prisma"])
      ? "Data Layer"
      : "",
    includesAny(corpus, ["deploy", "docker", "vercel", "kubernetes", "ci"])
      ? "Deployment Pipeline"
      : "",
    includesAny(corpus, ["notification", "email", "webhook"]) ? "Notification Surface" : "",
    includesAny(corpus, ["log", "trace", "observability", "sentry"])
      ? "Observability Pipeline"
      : "",
  ]);
}

function detectDependencies(corpus: string) {
  const dependencyNames = [
    "next",
    "react",
    "framer-motion",
    "lucide-react",
    "zod",
    "prisma",
    "stripe",
    "jsonwebtoken",
    "jose",
    "bullmq",
    "ioredis",
    "pg",
    "express",
    "fastify",
  ];

  return dependencyNames.filter((dependencyName) => corpus.includes(dependencyName));
}

function detectDependencySignals(corpus: string) {
  return uniqueCompact([
    includesAny(corpus, ["package-lock", "pnpm-lock", "yarn.lock"])
      ? "Lockfile present; dependency graph can be reconstructed"
      : "",
    includesAny(corpus, ["latest", "\"*\"", "workspace:*"])
      ? "Unbounded or workspace dependency version requires release scrutiny"
      : "",
    includesAny(corpus, ["legacy", "deprecated"])
      ? "Legacy or deprecated dependency path detected"
      : "",
    includesAny(corpus, ["peer dependency", "eresolve", "override"])
      ? "Peer dependency conflict or override signature present"
      : "",
    includesAny(corpus, ["worker", "queue"]) && includesAny(corpus, ["package.json", "lock"])
      ? "Worker runtime dependency parity requires verification"
      : "",
  ]);
}

function detectDuplicatedModules(paths: string[], corpus: string) {
  const candidates = ["auth", "validation", "validator", "config", "logger", "client", "api", "retry"];

  return candidates
    .filter((moduleName) => {
      const pathHits = paths.filter((path) =>
        path.toLowerCase().includes(moduleName),
      ).length;
      const contentHits = corpus.split(moduleName).length - 1;

      return pathHits > 1 || contentHits > 5;
    })
    .map((moduleName) => `${moduleName} authority appears duplicated`);
}

function detectSuspiciousPatterns(corpus: string) {
  return uniqueCompact([
    includesAny(corpus, ["todo", "fixme", "hack"])
      ? "Unresolved engineering markers remain in operational paths"
      : "",
    includesAny(corpus, ["any", "ts-ignore", "eslint-disable"])
      ? "Type-safety bypasses appear near critical code"
      : "",
    includesAny(corpus, ["eval(", "new function", "dangerouslysetinnerhtml"])
      ? "Unsafe dynamic execution or rendering pattern detected"
      : "",
    includesAny(corpus, ["process.env", "secret", "api_key", "password"])
      ? "Secret-bearing configuration surface requires review"
      : "",
    includesAny(corpus, ["retry", "timeout", "rate limit", "deadletter"])
      ? "Runtime pressure and retry behavior present"
      : "",
  ]);
}

function detectArchitectureDrift(corpus: string, paths: string[]) {
  return uniqueCompact([
    includesAny(corpus, ["legacy", "fallback"])
      ? "Legacy fallback path may bypass canonical service ownership"
      : "",
    includesAny(corpus, ["event", "queue", "replay"]) &&
    includesAny(corpus, ["auth", "validation"])
      ? "Asynchronous replay path touches trust or validation logic"
      : "",
    paths.some((path) => path.toLowerCase().includes("shared"))
      ? "Shared module surface may be carrying cross-domain behavior"
      : "",
    includesAny(corpus, ["adapter", "middleware"]) && includesAny(corpus, ["auth", "session"])
      ? "Auth responsibility appears split between adapters or middleware"
      : "",
  ]);
}

function detectSecuritySignals(corpus: string) {
  return uniqueCompact([
    includesAny(corpus, ["auth", "jwt", "session", "oauth"])
      ? "Authentication surface requires deterministic authority review"
      : "",
    includesAny(corpus, ["admin", "role", "permission", "rbac"])
      ? "Privilege and role boundary detected"
      : "",
    includesAny(corpus, ["webhook", "signature", "secret"])
      ? "Webhook or secret-bearing ingress path detected"
      : "",
    includesAny(corpus, ["validation", "schema", "sanitize"])
      ? "Validation layer present; fragmentation must be tested"
      : "",
  ]);
}

function detectScalingSignals(corpus: string) {
  return uniqueCompact([
    includesAny(corpus, ["queue", "worker", "redis", "bullmq"])
      ? "Queue or worker runtime can amplify retries under pressure"
      : "",
    includesAny(corpus, ["retry", "timeout", "backoff"])
      ? "Retry behavior can convert latency into cascading failures"
      : "",
    includesAny(corpus, ["rate limit", "throttle", "autoscale", "kubernetes"])
      ? "Scaling controls detected and require failure-mode simulation"
      : "",
    includesAny(corpus, ["database", "postgres", "connection"])
      ? "Database connection pressure can become system-wide degradation"
      : "",
  ]);
}

function buildArchitectureConnections(
  nodes: ArchitectureNode[],
  intelligence: RepositoryIntelligence,
): ArchitectureConnection[] {
  if (nodes.length < 2) {
    return [];
  }

  return nodes.slice(0, -1).map((node, index) => {
    const target = nodes[index + 1];
    const connectionType = inferConnectionType(node, target);
    const severity =
      connectionType === "auth" || connectionType === "queue"
        ? "high"
        : index > 2
          ? "medium"
          : "low";

    return {
      id: createId("conn", `${node.id}-${target.id}`),
      sourceId: node.id,
      targetId: target.id,
      type: connectionType,
      label: `${node.name} -> ${target.name}`,
      severity,
      confidence: clampScore(82 - index * 3 + intelligence.detectedServices.length),
      evidenceIds: [],
      metadata: {
        inferred: true,
      },
    };
  });
}

function aggregateEvidence(
  intelligence: RepositoryIntelligence,
  architecture: ArchitectureReport,
  riskMetrics: RiskOverview,
): AgentEvidence[] {
  const evidence: AgentEvidence[] = [];

  const addEvidence = (
    id: string,
    label: string,
    description: string,
    severity: RiskSeverity,
    tags: string[],
    confidence = 86,
  ) => {
    evidence.push({
      id,
      label,
      description,
      source: intelligence.sourceType,
      severity,
      confidence,
      tags,
      metadata: {
        fingerprint: intelligence.metadata.contentFingerprint,
      },
    });
  };

  architecture.architectureDrift.slice(0, 3).forEach((item, index) =>
    addEvidence(
      createId("evidence-drift", index),
      `DRIFT-${index + 1}`,
      item,
      "high",
      ["architecture", "drift"],
      88,
    ),
  );
  architecture.duplicatedModules.slice(0, 3).forEach((item, index) =>
    addEvidence(
      createId("evidence-duplication", index),
      `DUP-${index + 1}`,
      item,
      riskMetrics.severity,
      ["duplication", "authority"],
      90,
    ),
  );
  intelligence.securitySignals.slice(0, 2).forEach((item, index) =>
    addEvidence(
      createId("evidence-security", index),
      `SEC-${index + 1}`,
      item,
      riskMetrics.severity === "critical" ? "critical" : "high",
      ["security", "trust-boundary"],
      85,
    ),
  );
  intelligence.scalingSignals.slice(0, 2).forEach((item, index) =>
    addEvidence(
      createId("evidence-scaling", index),
      `SIM-${index + 1}`,
      item,
      riskMetrics.severity,
      ["scaling", "prediction"],
      87,
    ),
  );

  if (evidence.length === 0) {
    addEvidence(
      "evidence-baseline",
      "BASELINE-1",
      "Repository evidence was sparse, so GHOST TRACE generated a conservative forensic baseline.",
      "medium",
      ["baseline", "fallback"],
      72,
    );
  }

  return evidence;
}

function selectEvidenceForRole(role: AgentRole, evidence: AgentEvidence[]) {
  const roleTags: Record<AgentRole, string[]> = {
    ARCHITECT: ["architecture", "drift", "authority"],
    FORENSIC_ANALYST: ["duplication", "baseline", "architecture"],
    SECURITY_INVESTIGATOR: ["security", "trust-boundary", "authority"],
    FAILURE_PREDICTOR: ["scaling", "prediction", "runtime"],
    TIMELINE_RECONSTRUCTOR: ["architecture", "duplication", "scaling"],
  };
  const tags = roleTags[role];
  const selected = evidence.filter((item) =>
    item.tags?.some((tag) => tags.includes(tag)),
  );

  return ensureArray(selected, evidence).slice(0, 4);
}

function buildAgentMessage(
  role: AgentRole,
  intelligence: RepositoryIntelligence,
  architecture: ArchitectureReport,
  riskMetrics: RiskOverview,
) {
  const messages: Record<AgentRole, string> = {
    ARCHITECT: `Architecture drift detected across ${architecture.detectedServices.length} service zones. I classify ownership fragmentation as the primary collapse vector.`,
    FORENSIC_ANALYST: `Forensic correlation links duplicated modules and dependency instability. The system is degrading chronologically, not randomly.`,
    SECURITY_INVESTIGATOR: `I dispute a purely operational framing. ${firstOrFallback(
      intelligence.securitySignals,
      "Validation and authentication boundaries require deterministic proof.",
    )}`,
    FAILURE_PREDICTOR: `Projected failure risk is ${riskMetrics.projectedFailureRate}%. Scaling pressure can convert a localized defect into cascading runtime degradation.`,
    TIMELINE_RECONSTRUCTOR:
      "Timeline synthesis is locked: drift, duplicated authority, dependency uncertainty, security ambiguity, and runtime amplification.",
  };

  return messages[role];
}

function taskForRole(role: AgentRole) {
  const tasks: Record<AgentRole, string> = {
    ARCHITECT: "Mapping service ownership against runtime topology",
    FORENSIC_ANALYST: "Correlating module duplication with dependency and commit signals",
    SECURITY_INVESTIGATOR: "Challenging trust boundaries and validation assumptions",
    FAILURE_PREDICTOR: "Simulating future release-window collapse vectors",
    TIMELINE_RECONSTRUCTOR: "Sequencing evidence into a causal incident narrative",
  };

  return tasks[role];
}

function disagreementForRole(role: AgentRole, severity: RiskSeverity) {
  const intense = severity === "critical" || severity === "high";
  const disagreements: Record<AgentRole, string> = {
    ARCHITECT:
      "Disagrees with scale-first remediation; topology and ownership repair must define the final fix.",
    FORENSIC_ANALYST:
      "Challenges breach-first framing; evidence points to engineering drift as the initiating cause.",
    SECURITY_INVESTIGATOR:
      intense
        ? "Escalates the verdict because fragmented validation can become active exposure."
        : "Requests proof that internal validation remains deterministic.",
    FAILURE_PREDICTOR:
      "Disagrees on sequencing; runtime circuit breakers may need to ship before full architectural repair.",
    TIMELINE_RECONSTRUCTOR:
      "Synthesizes the debate: visible outages may be downstream symptoms of earlier structural drift.",
  };

  return disagreements[role];
}

function agentStatusForRole(role: AgentRole, severity: RiskSeverity): AgentStatus {
  if (role === "TIMELINE_RECONSTRUCTOR") {
    return "synthesized";
  }

  if (role === "SECURITY_INVESTIGATOR") {
    return severity === "critical" ? "escalating" : "disputing";
  }

  if (role === "FAILURE_PREDICTOR") {
    return severity === "low" ? "analyzing" : "escalating";
  }

  if (role === "FORENSIC_ANALYST") {
    return "concurring";
  }

  return "active";
}

function inferNodeType(service: string): ArchitectureNodeType {
  const normalized = service.toLowerCase();

  if (normalized.includes("web") || normalized.includes("frontend")) {
    return "frontend";
  }

  if (normalized.includes("api")) {
    return "api";
  }

  if (normalized.includes("auth")) {
    return "auth";
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

function inferConnectionType(
  source: ArchitectureNode,
  target: ArchitectureNode,
): ArchitectureConnection["type"] {
  if (source.type === "auth" || target.type === "auth") {
    return "auth";
  }

  if (source.type === "queue" || target.type === "queue" || target.type === "worker") {
    return "queue";
  }

  if (target.type === "database") {
    return "database";
  }

  if (source.type === "frontend" || target.type === "api") {
    return "http";
  }

  return "dependency";
}

function describeFrontend(intelligence: RepositoryIntelligence) {
  if (intelligence.detectedFrameworks.some((framework) => /next|react|vite/i.test(framework))) {
    return "Component-driven frontend surface detected with client/server state boundaries and repository investigation UI signals.";
  }

  return "Frontend structure is not explicit in the supplied evidence; UI risk remains inferred from API and auth coupling.";
}

function describeBackend(intelligence: RepositoryIntelligence, services: string[]) {
  const apiSignal = services.includes("API Gateway")
    ? "API gateway or route handler surface detected."
    : "API surface is implied but not fully mapped.";
  const dependencySignal = intelligence.dependencySignals.length
    ? ` Dependency concern: ${intelligence.dependencySignals[0]}.`
    : " Dependency graph did not expose a dominant instability signal.";

  return `${apiSignal}${dependencySignal}`;
}

function normalizeUnknownFile(file: unknown, index: number): RepositoryFile {
  const record = isRecord(file) ? file : {};

  return {
    path:
      readString(record, "path") ??
      readString(record, "name") ??
      `external-file-${index + 1}.txt`,
    content: readString(record, "content") ?? "",
    language: readString(record, "language"),
    sizeBytes: readNumber(record, "sizeBytes"),
  };
}

function normalizeArchitectureNode(node: unknown, index: number): ArchitectureNode {
  const record = isRecord(node) ? node : {};
  const name = readString(record, "name") ?? `Service ${index + 1}`;

  return {
    id: readString(record, "id") ?? createId("node", name),
    name,
    type: normalizeNodeType(readString(record, "type")),
    service: readString(record, "service"),
    path: readString(record, "path"),
    severity: normalizeRiskSeverity(readString(record, "severity")),
    healthScore: readNumber(record, "healthScore"),
    duplicated: typeof record.duplicated === "boolean" ? record.duplicated : undefined,
    suspiciousPatterns: readStringArray(record, "suspiciousPatterns"),
    metadata: isRecord(record.metadata) ? record.metadata : undefined,
  };
}

function normalizeArchitectureConnection(
  connection: unknown,
  index: number,
): ArchitectureConnection {
  const record = isRecord(connection) ? connection : {};

  return {
    id: readString(record, "id") ?? createId("conn", index),
    sourceId: readString(record, "sourceId") ?? "unknown-source",
    targetId: readString(record, "targetId") ?? "unknown-target",
    type: normalizeConnectionType(readString(record, "type")),
    label: readString(record, "label"),
    severity: normalizeRiskSeverity(readString(record, "severity")),
    confidence: readNumber(record, "confidence"),
    evidenceIds: readStringArray(record, "evidenceIds"),
    metadata: isRecord(record.metadata) ? record.metadata : undefined,
  };
}

function normalizeRiskMetric(metric: unknown, index: number): RiskMetric {
  const record = isRecord(metric) ? metric : {};
  const value = clampScore(readNumber(record, "value") ?? 0);

  return {
    id: readString(record, "id") ?? createId("risk", index),
    key: "risk_score",
    label: readString(record, "label") ?? `Risk Metric ${index + 1}`,
    value,
    severity: normalizeRiskSeverity(readString(record, "severity")) ?? scoreToSeverity(value),
    description: readString(record, "description"),
    trend: "rising",
    evidenceIds: readStringArray(record, "evidenceIds"),
  };
}

function normalizeRecommendation(
  recommendation: unknown,
  index: number,
): Recommendation {
  const record = isRecord(recommendation) ? recommendation : {};

  return {
    id: readString(record, "id") ?? createId("rec", index),
    title: readString(record, "title") ?? "Stabilize forensic risk vector",
    description:
      readString(record, "description") ??
      "External remediation module returned an incomplete recommendation.",
    priority: normalizePriority(readString(record, "priority")),
    ownerHint: readString(record, "ownerHint"),
    relatedRiskIds: readStringArray(record, "relatedRiskIds"),
  };
}

function normalizeSourceType(value?: string): SourceType {
  if (
    value === "repository-url" ||
    value === "uploaded-code" ||
    value === "mock-structure" ||
    value === "unknown"
  ) {
    return value;
  }

  return "unknown";
}

function normalizeRiskSeverity(value?: string): RiskSeverity | undefined {
  const normalized = value?.toLowerCase();

  if (
    normalized === "low" ||
    normalized === "medium" ||
    normalized === "moderate" ||
    normalized === "high" ||
    normalized === "critical"
  ) {
    return normalized === "moderate" ? "medium" : normalized;
  }

  return undefined;
}

function normalizeAgentRole(value?: string): AgentRole | undefined {
  const normalized = value?.replaceAll(" ", "_");

  if (
    normalized === "ARCHITECT" ||
    normalized === "FORENSIC_ANALYST" ||
    normalized === "SECURITY_INVESTIGATOR" ||
    normalized === "FAILURE_PREDICTOR" ||
    normalized === "TIMELINE_RECONSTRUCTOR"
  ) {
    return normalized;
  }

  return undefined;
}

function normalizeNodeType(value?: string): ArchitectureNodeType {
  const normalized = value?.toLowerCase();

  if (
    normalized === "frontend" ||
    normalized === "api" ||
    normalized === "service" ||
    normalized === "database" ||
    normalized === "queue" ||
    normalized === "auth" ||
    normalized === "worker" ||
    normalized === "external"
  ) {
    return normalized;
  }

  return "unknown";
}

function normalizeConnectionType(value?: string): ArchitectureConnection["type"] {
  const normalized = value?.toLowerCase();

  if (
    normalized === "http" ||
    normalized === "rpc" ||
    normalized === "event" ||
    normalized === "database" ||
    normalized === "queue" ||
    normalized === "auth" ||
    normalized === "dependency"
  ) {
    return normalized;
  }

  return "unknown";
}

function normalizePriority(value?: string): Recommendation["priority"] {
  if (value === "low" || value === "medium" || value === "high" || value === "urgent") {
    return value;
  }

  return "high";
}

function scoreToSeverity(score: number): RiskSeverity {
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

function severityFromCount(count: number, threshold: number): RiskSeverity {
  if (count > threshold + 2) {
    return "critical";
  }

  if (count > threshold) {
    return "high";
  }

  return "medium";
}

function findPathForService(service: string, paths: string[]) {
  const firstToken = service.toLowerCase().split(" ")[0] ?? "";

  return paths.find((path) => path.toLowerCase().includes(firstToken));
}

function firstOrFallback(values: string[], fallback: string) {
  return values.find((value) => value.trim().length > 0) ?? fallback;
}

function ensureList(values: string[], fallback: string[]) {
  return values.length > 0 ? values : fallback;
}

function ensureArray<T>(values: T[], fallback: T[]) {
  return values.length > 0 ? values : fallback;
}

function uniqueCompact(values: string[]) {
  return Array.from(new Set(values.filter((value) => value.trim().length > 0)));
}

function includesAny(value: string, terms: string[]) {
  return terms.some((term) => value.includes(term));
}

function containsAny(value: string, terms: string[]) {
  const normalized = value.toLowerCase();

  return terms.some((term) => normalized.includes(term));
}

function clampScore(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(value)));
}

function average(values: number[]) {
  if (values.length === 0) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function createId(prefix: string, seed: string | number) {
  return `${prefix}-${slugify(String(seed))}`;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72);
}

function fingerprint(value: string) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }

  return Math.abs(hash).toString(16).padStart(8, "0");
}

function now() {
  return new Date().toISOString();
}

async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  message: string,
): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(message)), timeoutMs);
  });

  try {
    return await Promise.race([promise, timeout]);
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}

function asOptionalModule(value: unknown): OptionalModule | undefined {
  return isRecord(value) ? value : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readRecord(
  value: Record<string, unknown>,
  key: string,
): Record<string, unknown> | undefined {
  const record = value[key];

  return isRecord(record) ? record : undefined;
}

function readString(value: Record<string, unknown>, key: string) {
  const item = value[key];

  return typeof item === "string" && item.trim().length > 0 ? item : undefined;
}

function readNumber(value: Record<string, unknown>, key: string) {
  const item = value[key];

  return typeof item === "number" && Number.isFinite(item) ? item : undefined;
}

function readStringArray(value: Record<string, unknown>, key: string) {
  const item = value[key];

  if (!Array.isArray(item)) {
    return undefined;
  }

  return item.filter((entry): entry is string => typeof entry === "string");
}

export const orchestrator = {
  analyzeRepository,
};

export default orchestrator;

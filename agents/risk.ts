import { mockAnalyzeResponse } from "@/lib/mockData";
import type {
  ArchitectureNode,
  ArchitectureReport,
  PredictedFailure,
  RiskMetric,
  RiskMetricKey,
  RiskOverview,
  RiskSeverity,
  TimelineEvent,
} from "@/types";

type RiskSignalCategory =
  | "authentication"
  | "deployment"
  | "api"
  | "dependency"
  | "scaling"
  | "cascade"
  | "retry"
  | "validation"
  | "infrastructure"
  | "ownership";

export interface RiskEngineInput {
  forensicFindings?: string[];
  dependencyIntelligence?: string[];
  instabilitySignals?: string[];
  suspiciousPatterns?: string[];
  duplicatedModules?: string[];
  architectureDrift?: string[];
  securitySignals?: string[];
  scalingSignals?: string[];
  detectedServices?: string[];
  dependencies?: string[];
  sampledPaths?: string[];
  fileCount?: number;
  sourceType?: string;
  codeExcerpt?: string;
}

export interface VulnerableSystem {
  id: string;
  name: string;
  type:
    | "service"
    | "module"
    | "dependency"
    | "infrastructure"
    | "security-boundary"
    | "deployment-surface";
  severity: RiskSeverity;
  exposureScore: number;
  weakPoints: string[];
  evidence: string[];
  forecast: string;
}

export interface ForecastWindow {
  horizon: "short-term" | "medium-term" | "long-term";
  probability: number;
  severity: RiskSeverity;
  narrative: string;
  likelyTriggers: string[];
  affectedSystems: string[];
}

export interface EscalationForecast {
  shortTerm: ForecastWindow;
  mediumTerm: ForecastWindow;
  longTerm: ForecastWindow;
  escalationProbability: number;
  escalationCertainty: number;
  narrative: string;
}

export interface StabilityAssessment {
  stabilityIndex: number;
  architectureIntegrity: number;
  failureProbability: number;
  escalationProbability: number;
  architectureStabilityConfidence: number;
  assessment: string;
  pressureZones: string[];
}

export interface RiskPredictionResult {
  riskMetrics: RiskOverview;
  predictedFailures: PredictedFailure[];
  vulnerableSystems: VulnerableSystem[];
  escalationForecast: EscalationForecast;
  stabilityAssessment: StabilityAssessment;
  confidence: number;
  generatedAt: string;
  usedFallback: boolean;

  // Compatibility fields consumed by the master orchestrator extension hook.
  riskScore: number;
  stabilityScore: number;
  integrityScore: number;
  projectedFailureRate: number;
  severity: RiskSeverity;
  engineeringHealth: string;
  metrics: RiskMetric[];
  summary: string;
}

interface RiskContext {
  findings: string[];
  dependencies: string[];
  signals: string[];
  suspiciousPatterns: string[];
  duplicatedModules: string[];
  architectureDrift: string[];
  securitySignals: string[];
  scalingSignals: string[];
  services: string[];
  architecture: ArchitectureReport;
  timeline: TimelineEvent[];
  sourceType: string;
  fileCount: number;
  categoryWeights: Record<RiskSignalCategory, number>;
}

interface ScoreProfile {
  riskScore: number;
  stabilityScore: number;
  integrityScore: number;
  projectedFailureRate: number;
  escalationProbability: number;
  confidence: number;
  severity: RiskSeverity;
}

const CATEGORY_TERMS: Record<RiskSignalCategory, string[]> = {
  authentication: ["auth", "session", "jwt", "oauth", "token", "permission", "role"],
  deployment: ["deploy", "release", "build", "ci", "environment", "vercel", "docker"],
  api: ["api", "route", "controller", "endpoint", "gateway", "ingress"],
  dependency: ["dependency", "package", "lockfile", "peer", "version", "legacy"],
  scaling: ["scale", "scaling", "autoscale", "traffic", "throughput", "latency"],
  cascade: ["cascade", "propagate", "fanout", "downstream", "blast", "failure"],
  retry: ["retry", "timeout", "backoff", "deadletter", "replay"],
  validation: ["validation", "validator", "schema", "sanitize", "payload"],
  infrastructure: ["queue", "worker", "redis", "database", "postgres", "kubernetes"],
  ownership: ["ownership", "boundary", "drift", "shared", "adapter", "middleware"],
};

const FALLBACK_SERVICES = [
  "API Gateway",
  "Auth Service",
  "Queue Workers",
  "Data Layer",
  "Deployment Pipeline",
];

export async function predictRisk(
  forensicFindings: RiskEngineInput = {},
  architectureAnalysis?: ArchitectureReport,
  timelineEvents: TimelineEvent[] = [],
): Promise<RiskPredictionResult> {
  try {
    await Promise.resolve();
    const context = normalizeRiskContext(
      forensicFindings,
      architectureAnalysis,
      timelineEvents,
    );
    const profile = scoreRiskContext(context);
    const riskMetrics = buildRiskOverview(context, profile);
    const vulnerableSystems = identifyVulnerableSystems(context, profile);
    const predictedFailures = generatePredictedFailures(
      context,
      profile,
      vulnerableSystems,
    );
    const escalationForecast = generateEscalationForecast(
      context,
      profile,
      vulnerableSystems,
    );
    const stabilityAssessment = buildStabilityAssessment(
      context,
      profile,
      vulnerableSystems,
    );

    return {
      riskMetrics,
      predictedFailures,
      vulnerableSystems,
      escalationForecast,
      stabilityAssessment,
      confidence: profile.confidence,
      generatedAt: now(),
      usedFallback: false,
      riskScore: riskMetrics.riskScore,
      stabilityScore: riskMetrics.stabilityScore,
      integrityScore: riskMetrics.integrityScore,
      projectedFailureRate: riskMetrics.projectedFailureRate,
      severity: riskMetrics.severity,
      engineeringHealth: riskMetrics.engineeringHealth,
      metrics: riskMetrics.metrics,
      summary: riskMetrics.summary ?? stabilityAssessment.assessment,
    };
  } catch {
    return generateFallbackRiskPrediction();
  }
}

export async function analyzeRisk(
  forensicFindings: RiskEngineInput = {},
  architectureAnalysis?: ArchitectureReport,
  timelineEvents: TimelineEvent[] = [],
): Promise<RiskPredictionResult> {
  return predictRisk(forensicFindings, architectureAnalysis, timelineEvents);
}

export async function run(
  forensicFindings: RiskEngineInput = {},
  architectureAnalysis?: ArchitectureReport,
  timelineEvents: TimelineEvent[] = [],
): Promise<RiskPredictionResult> {
  return predictRisk(forensicFindings, architectureAnalysis, timelineEvents);
}

export function generateFallbackRiskPrediction(): RiskPredictionResult {
  const riskMetrics = mockAnalyzeResponse.riskMetrics;
  const predictedFailures = mockAnalyzeResponse.predictedFailures;
  const vulnerableSystems: VulnerableSystem[] = [
    {
      id: "vulnerable-auth-service",
      name: "Auth Service",
      type: "security-boundary",
      severity: "critical",
      exposureScore: 91,
      weakPoints: [
        "Duplicated session authority",
        "Replay authorization can diverge from live traffic",
      ],
      evidence: ["evidence-auth-duplication", "evidence-validation-fragment"],
      forecast:
        "Authentication divergence may propagate across future scaling layers if replay paths keep independent trust decisions.",
    },
    {
      id: "vulnerable-queue-workers",
      name: "Queue Workers",
      type: "infrastructure",
      severity: "critical",
      exposureScore: 88,
      weakPoints: [
        "Retry amplification",
        "Dead-letter replay ambiguity",
        "Worker dependency drift",
      ],
      evidence: ["evidence-scaling-pressure", "evidence-dependency-drift"],
      forecast:
        "Retry amplification patterns suggest future infrastructure saturation risk.",
    },
    {
      id: "vulnerable-deployment-pipeline",
      name: "Deployment Pipeline",
      type: "deployment-surface",
      severity: "high",
      exposureScore: 77,
      weakPoints: ["Runtime parity gap", "Dependency resolution mismatch"],
      evidence: ["evidence-dependency-drift"],
      forecast:
        "Microservice dependency instability could trigger cascading deployment failures.",
    },
  ];
  const escalationForecast: EscalationForecast = {
    shortTerm: {
      horizon: "short-term",
      probability: 82,
      severity: "critical",
      narrative:
        "Within the next release window, retry density and duplicated auth authority can create intermittent authorization and worker saturation failures.",
      likelyTriggers: ["Peak traffic", "Billing replay", "Token revocation edge case"],
      affectedSystems: ["Auth Service", "Queue Workers", "API Gateway"],
    },
    mediumTerm: {
      horizon: "medium-term",
      probability: 76,
      severity: "high",
      narrative:
        "Dependency drift can convert routine deployments into inconsistent runtime behavior across API and worker surfaces.",
      likelyTriggers: ["Dependency upgrade", "Build cache miss", "Worker package drift"],
      affectedSystems: ["Deployment Pipeline", "Queue Workers"],
    },
    longTerm: {
      horizon: "long-term",
      probability: 71,
      severity: "high",
      narrative:
        "If ownership remains fragmented, observability will increasingly report symptoms instead of the first failing boundary.",
      likelyTriggers: ["Feature expansion", "New integration", "Service ownership split"],
      affectedSystems: ["Observability Pipeline", "API Gateway", "Data Layer"],
    },
    escalationProbability: 84,
    escalationCertainty: 91,
    narrative:
      "Fallback risk model forecasts a compound collapse path: auth divergence, dependency instability, retry amplification, and observability degradation.",
  };
  const stabilityAssessment: StabilityAssessment = {
    stabilityIndex: riskMetrics.stabilityScore,
    architectureIntegrity: riskMetrics.integrityScore,
    failureProbability: riskMetrics.projectedFailureRate,
    escalationProbability: escalationForecast.escalationProbability,
    architectureStabilityConfidence: 90,
    assessment:
      "The platform is recoverable but unstable. The next failure will likely present as scaling or deployment noise while originating from duplicated ownership boundaries.",
    pressureZones: ["auth", "validation", "queue replay", "dependency parity"],
  };

  return {
    riskMetrics,
    predictedFailures,
    vulnerableSystems,
    escalationForecast,
    stabilityAssessment,
    confidence: 90,
    generatedAt: now(),
    usedFallback: true,
    riskScore: riskMetrics.riskScore,
    stabilityScore: riskMetrics.stabilityScore,
    integrityScore: riskMetrics.integrityScore,
    projectedFailureRate: riskMetrics.projectedFailureRate,
    severity: riskMetrics.severity,
    engineeringHealth: riskMetrics.engineeringHealth,
    metrics: riskMetrics.metrics,
    summary: riskMetrics.summary ?? stabilityAssessment.assessment,
  };
}

function normalizeRiskContext(
  input: RiskEngineInput,
  architectureAnalysis?: ArchitectureReport,
  timelineEvents: TimelineEvent[] = [],
): RiskContext {
  const architecture = architectureAnalysis ?? buildMinimalArchitecture(input);
  const findings = uniqueCompact([
    ...readStringArray(input.forensicFindings),
    ...readStringArray(input.instabilitySignals),
    ...readStringArray(input.suspiciousPatterns),
    ...readStringArray(input.duplicatedModules),
    ...readStringArray(input.architectureDrift),
    ...readStringArray(input.securitySignals),
    ...readStringArray(input.scalingSignals),
    ...architecture.suspiciousPatterns,
    ...architecture.architectureDrift,
    ...architecture.duplicatedModules,
  ]);
  const dependencies = uniqueCompact([
    ...readStringArray(input.dependencies),
    ...readStringArray(input.dependencyIntelligence),
    ...architecture.dependencies,
    ...(architecture.dependencyConcerns ?? []),
  ]);
  const services = uniqueCompact([
    ...readStringArray(input.detectedServices),
    ...architecture.detectedServices,
    ...architecture.nodes.map((node) => node.name),
  ]);
  const signals = uniqueCompact([
    ...findings,
    ...dependencies,
    ...timelineEvents.map((event) => `${event.title} ${event.description}`),
    ...architecture.nodes.flatMap((node) => node.suspiciousPatterns ?? []),
  ]);

  return {
    findings,
    dependencies,
    signals,
    suspiciousPatterns: readStringArray(input.suspiciousPatterns).concat(
      architecture.suspiciousPatterns,
    ),
    duplicatedModules: readStringArray(input.duplicatedModules).concat(
      architecture.duplicatedModules,
    ),
    architectureDrift: readStringArray(input.architectureDrift).concat(
      architecture.architectureDrift,
    ),
    securitySignals: readStringArray(input.securitySignals),
    scalingSignals: readStringArray(input.scalingSignals),
    services: services.length > 0 ? services : FALLBACK_SERVICES,
    architecture,
    timeline: timelineEvents,
    sourceType: input.sourceType ?? "unknown",
    fileCount: input.fileCount ?? 0,
    categoryWeights: categorizeSignals(signals),
  };
}

function buildMinimalArchitecture(input: RiskEngineInput): ArchitectureReport {
  const services = readStringArray(input.detectedServices);
  const fallbackServices = services.length > 0 ? services : FALLBACK_SERVICES;
  const nodes: ArchitectureNode[] = fallbackServices.map((service, index) => ({
    id: createId("node", service),
    name: service,
    type: inferNodeType(service),
    service: slugify(service),
    severity: index < 2 ? "high" : "medium",
    healthScore: clampScore(72 - index * 6),
    suspiciousPatterns: readStringArray(input.suspiciousPatterns).slice(index, index + 2),
  }));

  return {
    detectedServices: fallbackServices,
    nodes,
    connections: [],
    dependencies: readStringArray(input.dependencies),
    duplicatedModules: readStringArray(input.duplicatedModules),
    suspiciousPatterns: readStringArray(input.suspiciousPatterns),
    architectureDrift: readStringArray(input.architectureDrift),
    dependencyConcerns: readStringArray(input.dependencyIntelligence),
    summary:
      "Minimal architecture context synthesized by risk engine from partial forensic intelligence.",
  };
}

function scoreRiskContext(context: RiskContext): ScoreProfile {
  const category = context.categoryWeights;
  const architectureHealthPenalty = context.architecture.nodes.reduce(
    (sum, node) => sum + (100 - (node.healthScore ?? 72)) / 9,
    0,
  );
  const timelinePenalty = context.timeline.filter((event) =>
    normalizeSeverity(event.severity) === "critical" ||
    normalizeSeverity(event.severity) === "high",
  ).length * 4;
  const signalWeight =
    category.authentication * 6 +
    category.deployment * 5 +
    category.api * 4 +
    category.dependency * 6 +
    category.scaling * 7 +
    category.cascade * 7 +
    category.retry * 7 +
    category.validation * 6 +
    category.infrastructure * 5 +
    category.ownership * 6;
  const riskScore = clampScore(
    34 +
      signalWeight +
      context.duplicatedModules.length * 7 +
      context.architectureDrift.length * 8 +
      context.suspiciousPatterns.length * 4 +
      timelinePenalty +
      architectureHealthPenalty,
  );
  const stabilityScore = clampScore(
    104 - riskScore - category.retry * 3 - category.infrastructure * 2,
  );
  const integrityScore = clampScore(
    84 -
      context.duplicatedModules.length * 6 -
      context.architectureDrift.length * 8 -
      category.ownership * 5 -
      category.validation * 3,
  );
  const projectedFailureRate = clampScore(
    riskScore - 7 + category.scaling * 5 + category.retry * 4 + category.cascade * 3,
  );
  const escalationProbability = clampScore(
    projectedFailureRate + category.cascade * 4 + category.deployment * 3,
  );
  const evidenceDepth = Math.min(
    24,
    context.signals.length +
      context.timeline.length +
      context.architecture.nodes.length +
      Math.floor(context.fileCount / 8),
  );
  const confidence = clampScore(68 + evidenceDepth + (riskScore > 78 ? 4 : 0));

  return {
    riskScore,
    stabilityScore,
    integrityScore,
    projectedFailureRate,
    escalationProbability,
    confidence,
    severity: scoreToSeverity(riskScore),
  };
}

function buildRiskOverview(context: RiskContext, profile: ScoreProfile): RiskOverview {
  const metrics: RiskMetric[] = [
    buildMetric(
      "risk-overall",
      "risk_score",
      "Overall Risk Score",
      profile.riskScore,
      "Composite instability score across trust boundaries, dependency volatility, scaling pressure, and architecture drift.",
    ),
    buildMetric(
      "risk-stability",
      "stability_score",
      "Stability Index",
      profile.stabilityScore,
      "Likelihood that the system can absorb release pressure without cross-service degradation.",
      true,
    ),
    buildMetric(
      "risk-integrity",
      "integrity_score",
      "Architecture Integrity",
      profile.integrityScore,
      "Measures whether service ownership, validation, and runtime contracts remain coherent.",
      true,
    ),
    buildMetric(
      "risk-failure-rate",
      "projected_failure_rate",
      "Failure Probability",
      profile.projectedFailureRate,
      "Projected probability of a future engineering failure under deployment or scaling pressure.",
    ),
    buildMetric(
      "risk-escalation",
      "scaling_pressure",
      "Escalation Probability",
      profile.escalationProbability,
      "Probability that localized instability spreads into a cascading system failure.",
    ),
    buildMetric(
      "risk-dependency-volatility",
      "dependency_volatility",
      "Dependency Volatility",
      clampScore(34 + context.categoryWeights.dependency * 13 + context.dependencies.length * 3),
      "Forecasts package, runtime, or deployment instability caused by dependency drift.",
    ),
    buildMetric(
      "risk-security-exposure",
      "security_exposure",
      "Security Exposure",
      clampScore(
        28 +
          context.categoryWeights.authentication * 12 +
          context.categoryWeights.validation * 9,
      ),
      "Predicts future validation bypasses and authentication inconsistency across execution paths.",
    ),
  ];

  return {
    riskScore: profile.riskScore,
    stabilityScore: profile.stabilityScore,
    integrityScore: profile.integrityScore,
    projectedFailureRate: profile.projectedFailureRate,
    severity: profile.severity,
    engineeringHealth: healthNarrative(profile.severity),
    metrics,
    summary: buildRiskSummary(context, profile),
    lastCalculatedAt: now(),
  };
}

function identifyVulnerableSystems(
  context: RiskContext,
  profile: ScoreProfile,
): VulnerableSystem[] {
  const fromNodes = context.architecture.nodes.map((node, index): VulnerableSystem => {
    const nodeSeverity = node.severity ?? scoreToSeverity(100 - (node.healthScore ?? 72));
    const exposureScore = clampScore(
      100 -
        (node.healthScore ?? 70) +
        profile.riskScore / 3 +
        (node.duplicated ? 12 : 0) +
        (node.suspiciousPatterns?.length ?? 0) * 5,
    );

    return {
      id: createId("vulnerable", node.id || node.name || index),
      name: node.name,
      type: vulnerableTypeForNode(node),
      severity: maxSeverity(nodeSeverity, scoreToSeverity(exposureScore)),
      exposureScore,
      weakPoints: uniqueCompact([
        ...(node.suspiciousPatterns ?? []),
        node.duplicated ? "Duplicated module authority" : "",
        ...(node.type === "auth" ? ["Authentication consistency risk"] : []),
        ...(node.type === "queue" || node.type === "worker"
          ? ["Retry amplification pressure"]
          : []),
      ]).slice(0, 4),
      evidence: buildSystemEvidence(context, node.name),
      forecast: forecastForSystem(node.name, node.type, exposureScore),
    };
  });
  const dependencySystems = context.dependencies.slice(0, 4).map((dependency, index) => ({
    id: createId("vulnerable-dependency", dependency),
    name: dependency,
    type: "dependency" as const,
    severity: scoreToSeverity(52 + context.categoryWeights.dependency * 9 + index * 3),
    exposureScore: clampScore(54 + context.categoryWeights.dependency * 8 + index * 3),
    weakPoints: ["Dependency parity risk", "Runtime behavior may diverge after release"],
    evidence: context.dependencies.slice(0, 3),
    forecast:
      "Dependency instability may surface as deployment degradation rather than a local package error.",
  }));
  const systems = [...fromNodes, ...dependencySystems]
    .sort((left, right) => right.exposureScore - left.exposureScore)
    .slice(0, 8);

  if (systems.length > 0) {
    return systems;
  }

  return [
    {
      id: "vulnerable-system-baseline",
      name: "Unknown Service Boundary",
      type: "service",
      severity: profile.severity,
      exposureScore: profile.riskScore,
      weakPoints: ["Sparse forensic data", "Unknown ownership boundary"],
      evidence: ["Risk engine received incomplete intelligence"],
      forecast:
        "Missing architecture evidence increases uncertainty; future failures may appear outside the observed service graph.",
    },
  ];
}

function generatePredictedFailures(
  context: RiskContext,
  profile: ScoreProfile,
  vulnerableSystems: VulnerableSystem[],
): PredictedFailure[] {
  const systems = vulnerableSystems.slice(0, 4).map((system) => system.name);
  const evidenceIds = vulnerableSystems.slice(0, 4).map((system) => system.id);
  const failures: PredictedFailure[] = [
    {
      id: "failure-authentication-divergence",
      title: "Authentication divergence across scaling layers",
      probability: clampScore(
        42 + context.categoryWeights.authentication * 14 + context.categoryWeights.validation * 8,
      ),
      severity: scoreToSeverity(
        42 + context.categoryWeights.authentication * 14 + context.categoryWeights.validation * 8,
      ),
      description:
        "Authentication divergence may propagate across future scaling layers if duplicated validation and session authority continue to coexist.",
      trigger: firstMatchingSignal(context, "authentication", "Token refresh, replay authorization, or role expansion"),
      impactedServices: systems,
      evidenceIds,
    },
    {
      id: "failure-deployment-instability",
      title: "Cascading deployment instability",
      probability: clampScore(
        38 + context.categoryWeights.dependency * 12 + context.categoryWeights.deployment * 10,
      ),
      severity: scoreToSeverity(
        38 + context.categoryWeights.dependency * 12 + context.categoryWeights.deployment * 10,
      ),
      description:
        "Microservice dependency instability could trigger cascading deployment failures when API, worker, and UI runtimes resolve different operational behavior.",
      trigger: firstMatchingSignal(context, "dependency", "Dependency upgrade or build/runtime parity drift"),
      impactedServices: systems,
      evidenceIds,
    },
    {
      id: "failure-retry-storm",
      title: "Retry storm infrastructure saturation",
      probability: clampScore(
        44 + context.categoryWeights.retry * 13 + context.categoryWeights.scaling * 11,
      ),
      severity: scoreToSeverity(
        44 + context.categoryWeights.retry * 13 + context.categoryWeights.scaling * 11,
      ),
      description:
        "Retry amplification patterns suggest future infrastructure saturation risk, especially if queue workers absorb malformed or ambiguous events.",
      trigger: firstMatchingSignal(context, "retry", "Traffic spike, provider latency, or dead-letter replay"),
      impactedServices: systems,
      evidenceIds,
    },
    {
      id: "failure-api-degradation",
      title: "API degradation from fragmented service ownership",
      probability: clampScore(
        36 + context.categoryWeights.api * 10 + context.categoryWeights.ownership * 12,
      ),
      severity: scoreToSeverity(
        36 + context.categoryWeights.api * 10 + context.categoryWeights.ownership * 12,
      ),
      description:
        "Fragmented service ownership may cause API degradation as recovery logic crosses domain boundaries and obscures first-failure causality.",
      trigger: firstMatchingSignal(context, "ownership", "New integration or cross-domain recovery path"),
      impactedServices: systems,
      evidenceIds,
    },
  ];

  return failures
    .map((failure) => ({
      ...failure,
      probability: clampScore(Math.max(failure.probability, profile.projectedFailureRate - 18)),
      severity: maxSeverity(
        normalizeSeverity(failure.severity),
        scoreToSeverity(Math.max(failure.probability, profile.projectedFailureRate - 18)),
      ),
    }))
    .sort((left, right) => right.probability - left.probability)
    .slice(0, 6);
}

function generateEscalationForecast(
  context: RiskContext,
  profile: ScoreProfile,
  vulnerableSystems: VulnerableSystem[],
): EscalationForecast {
  const affectedSystems = vulnerableSystems.slice(0, 5).map((system) => system.name);
  const shortTermProbability = clampScore(
    profile.projectedFailureRate + context.categoryWeights.retry * 3,
  );
  const mediumTermProbability = clampScore(
    profile.riskScore + context.categoryWeights.dependency * 4,
  );
  const longTermProbability = clampScore(
    profile.escalationProbability + context.categoryWeights.ownership * 5,
  );

  return {
    shortTerm: {
      horizon: "short-term",
      probability: shortTermProbability,
      severity: scoreToSeverity(shortTermProbability),
      narrative:
        "Short-term risk concentrates around retry storms, deployment variance, and API degradation during the next pressure event.",
      likelyTriggers: uniqueCompact([
        firstMatchingSignal(context, "retry", "Retry amplification"),
        firstMatchingSignal(context, "scaling", "Traffic spike"),
        firstMatchingSignal(context, "api", "API latency under load"),
      ]),
      affectedSystems,
    },
    mediumTerm: {
      horizon: "medium-term",
      probability: mediumTermProbability,
      severity: scoreToSeverity(mediumTermProbability),
      narrative:
        "Medium-term degradation is likely if dependency parity, validation contracts, and service ownership remain fragmented.",
      likelyTriggers: uniqueCompact([
        firstMatchingSignal(context, "dependency", "Dependency drift"),
        firstMatchingSignal(context, "validation", "Validation bypass"),
        firstMatchingSignal(context, "deployment", "Release-window configuration drift"),
      ]),
      affectedSystems,
    },
    longTerm: {
      horizon: "long-term",
      probability: longTermProbability,
      severity: scoreToSeverity(longTermProbability),
      narrative:
        "Long-term collapse becomes plausible if architecture drift normalizes into the operating model and observability keeps reporting symptoms instead of causes.",
      likelyTriggers: uniqueCompact([
        firstMatchingSignal(context, "ownership", "Fragmented ownership"),
        firstMatchingSignal(context, "cascade", "Cascading downstream failure"),
        "Feature expansion without control-plane repair",
      ]),
      affectedSystems,
    },
    escalationProbability: profile.escalationProbability,
    escalationCertainty: profile.confidence,
    narrative:
      "The escalation model predicts a layered collapse trajectory: local instability becomes retry pressure, retry pressure becomes infrastructure saturation, and saturation hides the root cause behind repeated downstream symptoms.",
  };
}

function buildStabilityAssessment(
  context: RiskContext,
  profile: ScoreProfile,
  vulnerableSystems: VulnerableSystem[],
): StabilityAssessment {
  const pressureZones = uniqueCompact([
    ...vulnerableSystems.slice(0, 5).map((system) => system.name),
    ...Object.entries(context.categoryWeights)
      .filter(([, weight]) => weight > 0)
      .map(([category]) => category),
  ]).slice(0, 8);

  return {
    stabilityIndex: profile.stabilityScore,
    architectureIntegrity: profile.integrityScore,
    failureProbability: profile.projectedFailureRate,
    escalationProbability: profile.escalationProbability,
    architectureStabilityConfidence: profile.confidence,
    assessment:
      profile.severity === "critical"
        ? "The system is in a mission-critical instability band. The next visible failure will likely present as deployment, API, or scaling noise while originating from deeper architecture degradation."
        : profile.severity === "high"
          ? "The system remains recoverable, but the risk engine predicts credible near-term degradation across vulnerable service boundaries."
          : "The system is stable enough to continue operating, but predictive signals justify monitoring dependency, validation, and ownership boundaries.",
    pressureZones,
  };
}

function buildMetric(
  id: string,
  key: RiskMetricKey,
  label: string,
  value: number,
  description: string,
  inverse = false,
): RiskMetric {
  const severity = inverse ? scoreToSeverity(100 - value) : scoreToSeverity(value);

  return {
    id,
    key,
    label,
    value: clampScore(value),
    severity,
    description,
    trend: value > 82 ? "spiking" : value > 62 ? "rising" : value < 38 ? "falling" : "stable",
  };
}

function buildRiskSummary(context: RiskContext, profile: ScoreProfile) {
  const dominant = dominantCategories(context.categoryWeights).join(", ");

  return `The failure prediction engine classifies the system as ${profile.severity.toUpperCase()} risk. Dominant instability vectors: ${
    dominant || "insufficient explicit signal"
  }. The next failure is likely to appear as deployment degradation, API instability, or infrastructure saturation rather than a clean single-module defect.`;
}

function categorizeSignals(signals: string[]): Record<RiskSignalCategory, number> {
  const weights = emptyWeights();

  for (const signal of signals) {
    const normalized = signal.toLowerCase();

    for (const [category, terms] of Object.entries(CATEGORY_TERMS) as Array<
      [RiskSignalCategory, string[]]
    >) {
      if (terms.some((term) => normalized.includes(term))) {
        weights[category] += 1;
      }
    }
  }

  return weights;
}

function emptyWeights(): Record<RiskSignalCategory, number> {
  return {
    authentication: 0,
    deployment: 0,
    api: 0,
    dependency: 0,
    scaling: 0,
    cascade: 0,
    retry: 0,
    validation: 0,
    infrastructure: 0,
    ownership: 0,
  };
}

function dominantCategories(weights: Record<RiskSignalCategory, number>) {
  return Object.entries(weights)
    .filter(([, value]) => value > 0)
    .sort((left, right) => right[1] - left[1])
    .slice(0, 4)
    .map(([category]) => category.replace("-", " "));
}

function firstMatchingSignal(
  context: RiskContext,
  category: RiskSignalCategory,
  fallback: string,
) {
  const terms = CATEGORY_TERMS[category];

  return (
    context.signals.find((signal) =>
      terms.some((term) => signal.toLowerCase().includes(term)),
    ) ?? fallback
  );
}

function buildSystemEvidence(context: RiskContext, systemName: string) {
  const token = systemName.toLowerCase().split(" ")[0] ?? "";
  const evidence = context.signals.filter((signal) =>
    signal.toLowerCase().includes(token),
  );

  return ensureList(evidence, context.signals).slice(0, 4);
}

function forecastForSystem(
  systemName: string,
  nodeType: ArchitectureNode["type"],
  exposureScore: number,
) {
  if (nodeType === "auth") {
    return `${systemName} may produce inconsistent authorization decisions as traffic, replay, or session refresh paths multiply.`;
  }

  if (nodeType === "queue" || nodeType === "worker") {
    return `${systemName} can become a saturation point if retries amplify faster than recovery capacity.`;
  }

  if (nodeType === "database") {
    return `${systemName} can convert localized retries into systemic latency once write contention rises.`;
  }

  if (nodeType === "api") {
    return `${systemName} may degrade first, even if the initiating defect lives in a dependency or ownership boundary.`;
  }

  if (exposureScore > 78) {
    return `${systemName} is a high-exposure propagation point for future cascading failures.`;
  }

  return `${systemName} remains watchlisted by the predictive risk engine.`;
}

function vulnerableTypeForNode(node: ArchitectureNode): VulnerableSystem["type"] {
  if (node.type === "auth") {
    return "security-boundary";
  }

  if (node.type === "queue" || node.type === "worker" || node.type === "database") {
    return "infrastructure";
  }

  if (node.type === "external") {
    return "dependency";
  }

  if (node.type === "api") {
    return "service";
  }

  return "service";
}

function healthNarrative(severity: RiskSeverity) {
  if (severity === "critical") {
    return "Critical predictive instability: future engineering failure is likely without immediate control-plane correction.";
  }

  if (severity === "high") {
    return "High risk: the system is recoverable but vulnerable to deployment, dependency, or scaling pressure.";
  }

  if (severity === "medium") {
    return "Moderate risk: watchlisted instability vectors should be remediated before they compound.";
  }

  return "Low risk: no immediate collapse trajectory detected, but forensic monitoring remains active.";
}

function maxSeverity(left: RiskSeverity, right: RiskSeverity): RiskSeverity {
  const rank: Record<RiskSeverity, number> = {
    low: 1,
    medium: 2,
    high: 3,
    critical: 4,
  };

  return rank[left] >= rank[right] ? left : right;
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

function normalizeSeverity(value: PredictedFailure["severity"] | TimelineEvent["severity"]): RiskSeverity {
  const normalized = String(value).toLowerCase();

  if (normalized === "critical") {
    return "critical";
  }

  if (normalized === "high") {
    return "high";
  }

  if (normalized === "medium" || normalized === "moderate") {
    return "medium";
  }

  return "low";
}

function inferNodeType(service: string): ArchitectureNode["type"] {
  const normalized = service.toLowerCase();

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

  if (normalized.includes("api")) {
    return "api";
  }

  if (normalized.includes("web") || normalized.includes("frontend")) {
    return "frontend";
  }

  if (normalized.includes("deploy")) {
    return "external";
  }

  return "service";
}

function readStringArray(values: string[] | undefined): string[] {
  return Array.isArray(values)
    ? values.filter((value) => typeof value === "string" && value.trim().length > 0)
    : [];
}

function ensureList(values: string[], fallback: string[]) {
  return values.length > 0 ? values : fallback;
}

function uniqueCompact(values: string[]) {
  return Array.from(new Set(values.filter((value) => value.trim().length > 0)));
}

function clampScore(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(value)));
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

function now() {
  return new Date().toISOString();
}

export const risk = {
  predictRisk,
  analyzeRisk,
  run,
  generateFallbackRiskPrediction,
};

export default risk;

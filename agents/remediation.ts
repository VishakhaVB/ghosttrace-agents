import type {
  ArchitectureReport,
  PredictedFailure,
  Recommendation,
  RiskOverview,
  RiskSeverity,
  TimelineEvent,
} from "@/types";

export type RemediationDomain =
  | "authentication"
  | "dependencies"
  | "validation"
  | "architecture"
  | "scaling"
  | "retry"
  | "ownership"
  | "api"
  | "cascade"
  | "observability";

export type RecoveryPhaseId =
  | "phase-1-emergency-stabilization"
  | "phase-2-architectural-containment"
  | "phase-3-service-normalization"
  | "phase-4-resilience-hardening";

export type RecoveryHorizon = "immediate" | "short-term" | "long-term";

export type ActionPriority = "low" | "medium" | "high" | "urgent";

export interface AgentContradictionInput {
  id?: string;
  challenger?: string;
  target?: string;
  topic?: string;
  claim?: string;
  counterClaim?: string;
  evidenceIds?: string[];
  severity?: RiskSeverity | string;
  confidence?: number;
}

export interface VulnerableSystemInput {
  id?: string;
  name?: string;
  type?: string;
  severity?: RiskSeverity | string;
  exposureScore?: number;
  weakPoints?: string[];
  evidence?: string[];
  forecast?: string;
}

export interface RemediationEngineInput {
  forensicIntelligence?: unknown;
  forensicFindings?: string[];
  riskAnalysis?: Partial<RiskOverview> | Record<string, unknown>;
  riskPredictions?: Record<string, unknown>;
  timelineFindings?: TimelineEvent[] | unknown[];
  timeline?: TimelineEvent[] | unknown[];
  architectureReport?: Partial<ArchitectureReport> | Record<string, unknown>;
  architecture?: Partial<ArchitectureReport> | Record<string, unknown>;
  contradictions?: AgentContradictionInput[];
  vulnerableSystems?: VulnerableSystemInput[] | unknown[];
  predictedFailures?: PredictedFailure[] | unknown[];
  dependencies?: string[];
  dependencySignals?: string[];
  duplicatedModules?: string[];
  suspiciousPatterns?: string[];
  architectureDrift?: string[];
  securitySignals?: string[];
  scalingSignals?: string[];
  detectedServices?: string[];
  metadata?: Record<string, unknown>;
}

export interface RemediationAiProvider {
  generateRemediation: (
    input: RemediationEngineInput,
    context: RemediationContext,
  ) => Promise<Partial<RemediationIntelligence> | string | null>;
}

export interface RemediationOptions {
  aiProvider?: RemediationAiProvider;
  preferAi?: boolean;
  allowFallback?: boolean;
  now?: () => string;
}

export interface StabilizationStrategy {
  id: string;
  domain: RemediationDomain;
  title: string;
  objective: string;
  severity: RiskSeverity;
  confidence: number;
  executionNotes: string[];
  successSignals: string[];
  ownerHint: string;
}

export interface PriorityAction {
  id: string;
  title: string;
  description: string;
  domain: RemediationDomain;
  priority: ActionPriority;
  horizon: RecoveryHorizon;
  severity: RiskSeverity;
  ownerHint: string;
  blocksRelease: boolean;
  evidence: string[];
  successCriteria: string[];
}

export interface RecoveryTimelinePhase {
  id: RecoveryPhaseId;
  phase: string;
  objective: string;
  timeframe: string;
  commandPosture: string;
  actions: string[];
  exitCriteria: string[];
  riskReduction: number;
}

export interface ArchitectureRecommendation {
  id: string;
  domain: RemediationDomain;
  title: string;
  recommendation: string;
  rationale: string;
  targetSystems: string[];
  expectedImpact: string;
  priority: ActionPriority;
}

export interface PreventionMeasure {
  id: string;
  domain: RemediationDomain;
  title: string;
  measure: string;
  governanceSignal: string;
  observabilitySignal: string;
  deploymentSafeguard: string;
}

export interface RemediationConfidence {
  remediationConfidence: number;
  recoveryFeasibility: number;
  stabilizationProbability: number;
  evidenceCompleteness: number;
  method: "heuristic" | "ai-assisted" | "cinematic-fallback";
}

export interface RemediationPlan {
  summary: string;
  missionObjective: string;
  commandPosture: string;
  releaseGateRequired: boolean;
  recommendations: Recommendation[];
  priorityOrder: string[];
}

export interface RemediationIntelligence {
  remediationPlan: RemediationPlan;
  stabilizationStrategies: StabilizationStrategy[];
  priorityActions: PriorityAction[];
  recoveryTimeline: RecoveryTimelinePhase[];
  architectureRecommendations: ArchitectureRecommendation[];
  preventionMeasures: PreventionMeasure[];
  confidence: RemediationConfidence;

  // Compatibility surface consumed by the master orchestrator extension hook.
  summary: string;
  recommendations: Recommendation[];
  releaseGateRequired: boolean;
  priorityOrder: string[];
}

interface RemediationContext {
  riskScore: number;
  severity: RiskSeverity;
  stabilityScore: number;
  integrityScore: number;
  projectedFailureRate: number;
  services: string[];
  dependencies: string[];
  findings: string[];
  duplicatedModules: string[];
  suspiciousPatterns: string[];
  architectureDrift: string[];
  securitySignals: string[];
  scalingSignals: string[];
  timelineSignals: string[];
  contradictionSignals: string[];
  vulnerableSystems: VulnerableSystemInput[];
  predictedFailures: PredictedFailure[];
  architecture: Partial<ArchitectureReport>;
  domainWeights: Record<RemediationDomain, number>;
  evidenceCompleteness: number;
}

interface RecoveryDirective {
  domain: RemediationDomain;
  title: string;
  action: string;
  rationale: string;
  severity: RiskSeverity;
  priority: ActionPriority;
  ownerHint: string;
  evidence: string[];
  targetSystems: string[];
  successCriteria: string[];
}

const DOMAIN_TERMS: Record<RemediationDomain, string[]> = {
  authentication: ["auth", "session", "jwt", "oauth", "token", "permission", "role"],
  dependencies: ["dependency", "package", "lockfile", "version", "peer", "runtime parity"],
  validation: ["validation", "validator", "schema", "sanitize", "payload", "boundary"],
  architecture: ["architecture", "drift", "topology", "legacy", "migration", "boundary"],
  scaling: ["scale", "scaling", "traffic", "latency", "throughput", "queue", "worker"],
  retry: ["retry", "replay", "backoff", "dead-letter", "deadletter", "timeout"],
  ownership: ["ownership", "service", "shared", "domain", "adapter", "fragment"],
  api: ["api", "endpoint", "route", "controller", "webhook", "contract"],
  cascade: ["cascade", "blast", "downstream", "propagate", "failure", "collapse"],
  observability: ["observability", "telemetry", "trace", "metric", "logger", "incident"],
};

const FALLBACK_SERVICES = [
  "Auth Service",
  "API Gateway",
  "Validation Boundary",
  "Queue Workers",
  "Deployment Pipeline",
];

export async function produceRemediation(
  input: RemediationEngineInput = {},
  architecture?: Partial<ArchitectureReport>,
  riskAnalysis?: Partial<RiskOverview>,
  contradictions: AgentContradictionInput[] = [],
  options: RemediationOptions = {},
): Promise<RemediationIntelligence> {
  try {
    await asyncBoundary();
    const normalizedInput = normalizeInput(input, architecture, riskAnalysis, contradictions);
    const context = buildRemediationContext(normalizedInput);
    const heuristic = synthesizeRemediation(context);

    if (options.preferAi && options.aiProvider) {
      const aiReport = await tryGenerateAiRemediation(normalizedInput, context, options.aiProvider);

      if (aiReport) {
        return mergeRemediation(heuristic, aiReport);
      }
    }

    return heuristic;
  } catch (error) {
    if (options.allowFallback === false) {
      throw error;
    }

    return generateFallbackRemediation(error, options);
  }
}

export async function generateRemediation(
  input: RemediationEngineInput = {},
  architecture?: Partial<ArchitectureReport>,
  riskAnalysis?: Partial<RiskOverview>,
  contradictions: AgentContradictionInput[] = [],
  options: RemediationOptions = {},
): Promise<RemediationIntelligence> {
  return produceRemediation(input, architecture, riskAnalysis, contradictions, options);
}

export async function recommend(
  input: RemediationEngineInput = {},
  architecture?: Partial<ArchitectureReport>,
  riskAnalysis?: Partial<RiskOverview>,
  contradictions: AgentContradictionInput[] = [],
  options: RemediationOptions = {},
): Promise<RemediationIntelligence> {
  return produceRemediation(input, architecture, riskAnalysis, contradictions, options);
}

export async function run(
  input: RemediationEngineInput = {},
  architecture?: Partial<ArchitectureReport>,
  riskAnalysis?: Partial<RiskOverview>,
  contradictions: AgentContradictionInput[] = [],
  options: RemediationOptions = {},
): Promise<RemediationIntelligence> {
  return produceRemediation(input, architecture, riskAnalysis, contradictions, options);
}

function normalizeInput(
  input: RemediationEngineInput,
  architecture?: Partial<ArchitectureReport>,
  riskAnalysis?: Partial<RiskOverview>,
  contradictions: AgentContradictionInput[] = [],
): RemediationEngineInput {
  const record = isRecord(input) ? input : {};
  const embeddedArchitecture =
    readRecord(record, "architectureReport") ?? readRecord(record, "architecture") ?? {};
  const embeddedRisk =
    readRecord(record, "riskAnalysis") ?? readRecord(record, "riskPredictions") ?? {};

  return {
    ...record,
    architectureReport: {
      ...embeddedArchitecture,
      ...(architecture ?? {}),
    },
    riskAnalysis: {
      ...embeddedRisk,
      ...(riskAnalysis ?? {}),
    },
    contradictions: uniqueContradictions([
      ...normalizeContradictions(readArray(record, "contradictions")),
      ...contradictions,
    ]),
  };
}

function buildRemediationContext(input: RemediationEngineInput): RemediationContext {
  const architecture = normalizeArchitecture(input.architectureReport ?? input.architecture);
  const risk = normalizeRisk(input.riskAnalysis ?? input.riskPredictions);
  const timeline = normalizeTimeline([
    ...readUnknownArray(input.timelineFindings),
    ...readUnknownArray(input.timeline),
  ]);
  const vulnerableSystems = normalizeVulnerableSystems(input.vulnerableSystems);
  const predictedFailures = normalizePredictedFailures(input.predictedFailures);
  const forensicSignals = extractForensicSignals(input.forensicIntelligence);
  const contradictions = normalizeContradictions(input.contradictions ?? []);
  const services = uniqueStrings([
    ...readStringArray(input.detectedServices),
    ...(architecture.detectedServices ?? []),
    ...(architecture.nodes ?? []).map((node) => node.name),
    ...vulnerableSystems.map((system) => system.name ?? ""),
  ]);
  const dependencies = uniqueStrings([
    ...readStringArray(input.dependencies),
    ...readStringArray(input.dependencySignals),
    ...(architecture.dependencies ?? []),
    ...(architecture.dependencyConcerns ?? []),
  ]);
  const duplicatedModules = uniqueStrings([
    ...readStringArray(input.duplicatedModules),
    ...(architecture.duplicatedModules ?? []),
    ...forensicSignals.filter((signal) => includesDomain(signal, "authentication")),
  ]);
  const suspiciousPatterns = uniqueStrings([
    ...readStringArray(input.suspiciousPatterns),
    ...(architecture.suspiciousPatterns ?? []),
    ...forensicSignals,
  ]);
  const architectureDrift = uniqueStrings([
    ...readStringArray(input.architectureDrift),
    ...(architecture.architectureDrift ?? []),
    ...forensicSignals.filter((signal) => includesDomain(signal, "architecture")),
  ]);
  const securitySignals = uniqueStrings([
    ...readStringArray(input.securitySignals),
    ...forensicSignals.filter((signal) => includesDomain(signal, "authentication")),
    ...forensicSignals.filter((signal) => includesDomain(signal, "validation")),
  ]);
  const scalingSignals = uniqueStrings([
    ...readStringArray(input.scalingSignals),
    ...forensicSignals.filter((signal) => includesDomain(signal, "scaling")),
    ...predictedFailures.map((failure) => `${failure.title} ${failure.description}`),
  ]);
  const timelineSignals = timeline.map((event) => `${event.title} ${event.description}`);
  const contradictionSignals = contradictions.map((item) =>
    `${item.topic ?? ""} ${item.claim ?? ""} ${item.counterClaim ?? ""}`,
  );
  const findings = uniqueStrings([
    ...readStringArray(input.forensicFindings),
    ...suspiciousPatterns,
    ...architectureDrift,
    ...securitySignals,
    ...scalingSignals,
    ...timelineSignals,
    ...contradictionSignals,
    ...dependencies,
  ]);
  const domainWeights = scoreDomains([
    ...findings,
    ...services,
    ...vulnerableSystems.flatMap((system) => [
      system.name ?? "",
      ...(system.weakPoints ?? []),
      system.forecast ?? "",
    ]),
  ]);

  return {
    riskScore: risk.riskScore,
    severity: risk.severity,
    stabilityScore: risk.stabilityScore,
    integrityScore: risk.integrityScore,
    projectedFailureRate: risk.projectedFailureRate,
    services: services.length > 0 ? services : FALLBACK_SERVICES,
    dependencies,
    findings,
    duplicatedModules,
    suspiciousPatterns,
    architectureDrift,
    securitySignals,
    scalingSignals,
    timelineSignals,
    contradictionSignals,
    vulnerableSystems,
    predictedFailures,
    architecture,
    domainWeights,
    evidenceCompleteness: calculateEvidenceCompleteness({
      findings,
      services,
      dependencies,
      timeline,
      vulnerableSystems,
      predictedFailures,
      contradictions,
    }),
  };
}

function synthesizeRemediation(
  context: RemediationContext,
): RemediationIntelligence {
  const directives = buildRecoveryDirectives(context);
  const priorityActions = buildPriorityActions(context, directives);
  const stabilizationStrategies = buildStabilizationStrategies(context, directives);
  const recoveryTimeline = buildRecoveryTimeline(context, priorityActions);
  const architectureRecommendations = buildArchitectureRecommendations(context, directives);
  const preventionMeasures = buildPreventionMeasures(context, directives);
  const recommendations = buildCompatibilityRecommendations(priorityActions);
  const releaseGateRequired = shouldGateRelease(context, priorityActions);
  const priorityOrder = priorityActions.map((action) => action.id);
  const confidence = buildConfidence(context, directives);
  const remediationPlan: RemediationPlan = {
    summary: buildSummary(context, directives, releaseGateRequired),
    missionObjective: buildMissionObjective(context),
    commandPosture: commandPosture(context),
    releaseGateRequired,
    recommendations,
    priorityOrder,
  };

  return {
    remediationPlan,
    stabilizationStrategies,
    priorityActions,
    recoveryTimeline,
    architectureRecommendations,
    preventionMeasures,
    confidence,
    summary: remediationPlan.summary,
    recommendations,
    releaseGateRequired,
    priorityOrder,
  };
}

function buildRecoveryDirectives(context: RemediationContext): RecoveryDirective[] {
  const directives: RecoveryDirective[] = [
    buildAuthenticationDirective(context),
    buildValidationDirective(context),
    buildDependencyDirective(context),
    buildArchitectureDirective(context),
    buildScalingDirective(context),
    buildRetryDirective(context),
    buildOwnershipDirective(context),
    buildApiDirective(context),
    buildCascadeDirective(context),
    buildObservabilityDirective(context),
  ];
  const active = directives.filter((directive) => {
    const weight = context.domainWeights[directive.domain];
    return (
      weight > 0 ||
      directive.severity === "critical" ||
      (context.riskScore >= 72 && criticalDomains().includes(directive.domain))
    );
  });

  return (active.length > 0 ? active : fallbackDirectives(context))
    .sort((left, right) => priorityRank(right.priority) - priorityRank(left.priority))
    .slice(0, 10);
}

function buildAuthenticationDirective(context: RemediationContext): RecoveryDirective {
  const evidence = evidenceForDomain(context, "authentication");
  const severity = maxSeverity(
    severityFromWeight(context.domainWeights.authentication),
    context.duplicatedModules.some((moduleName) => includesDomain(moduleName, "authentication"))
      ? "critical"
      : "medium",
  );

  return {
    domain: "authentication",
    title: "Centralize authentication ownership",
    action:
      "Collapse session, token, middleware, and worker authorization into one auditable trust authority before any scaling or feature propagation continues.",
    rationale:
      "Authentication ownership should be centralized before scaling propagation amplifies validation inconsistency across downstream services.",
    severity,
    priority: severity === "critical" ? "urgent" : "high",
    ownerHint: "Security platform",
    evidence,
    targetSystems: targetSystems(context, "authentication", ["Auth Service", "API Gateway"]),
    successCriteria: [
      "One canonical auth policy module owns every allow/deny verdict.",
      "Workers, route handlers, and middleware consume the same revocation and role source.",
      "Authorization contract tests cover live traffic and replay traffic.",
    ],
  };
}

function buildValidationDirective(context: RemediationContext): RecoveryDirective {
  const evidence = evidenceForDomain(context, "validation");
  const severity = maxSeverity(
    severityFromWeight(context.domainWeights.validation),
    evidence.length > 1 ? "high" : "medium",
  );

  return {
    domain: "validation",
    title: "Rebuild validation as a system boundary",
    action:
      "Move validation out of scattered local checks and into canonical ingress contracts shared by APIs, webhooks, and asynchronous consumers.",
    rationale:
      "Validation fragmentation lets malformed events travel under different identities depending on the path they take through the platform.",
    severity,
    priority: severity === "critical" ? "urgent" : "high",
    ownerHint: "API platform",
    evidence,
    targetSystems: targetSystems(context, "validation", ["API Gateway", "Validation Boundary"]),
    successCriteria: [
      "Every public ingress has a named schema owner.",
      "Queue consumers reject payloads that cannot prove canonical validation.",
      "Schema drift fails CI before release packaging begins.",
    ],
  };
}

function buildDependencyDirective(context: RemediationContext): RecoveryDirective {
  const evidence = evidenceForDomain(context, "dependencies");
  const severity = maxSeverity(
    severityFromWeight(context.domainWeights.dependencies),
    context.dependencies.length > 3 ? "high" : "medium",
  );

  return {
    domain: "dependencies",
    title: "Freeze and isolate dependency volatility",
    action:
      "Lock runtime packages, isolate volatile adapters, and run production-parity dependency resolution for web, API, and worker surfaces.",
    rationale:
      "Dependency instability often disguises itself as deployment failure; recovery begins by making runtime behavior deterministic again.",
    severity,
    priority: severity === "critical" ? "urgent" : "high",
    ownerHint: "Developer infrastructure",
    evidence,
    targetSystems: targetSystems(context, "dependencies", ["Deployment Pipeline", "Worker Runtime"]),
    successCriteria: [
      "No floating production dependency versions remain.",
      "Worker and API dependency graphs are compared in CI.",
      "Volatile third-party adapters are wrapped behind owned compatibility interfaces.",
    ],
  };
}

function buildArchitectureDirective(context: RemediationContext): RecoveryDirective {
  const evidence = evidenceForDomain(context, "architecture");
  const severity = maxSeverity(
    severityFromWeight(context.domainWeights.architecture),
    context.integrityScore < 55 ? "critical" : "medium",
  );

  return {
    domain: "architecture",
    title: "Contain architecture drift",
    action:
      "Re-map intended service ownership against runtime behavior, quarantine legacy paths, and block cross-domain shortcuts until boundaries are explicit again.",
    rationale:
      "Architecture drift becomes collapse when emergency fixes become permanent infrastructure without ownership.",
    severity,
    priority: severity === "critical" ? "urgent" : "high",
    ownerHint: "Architecture council",
    evidence,
    targetSystems: targetSystems(context, "architecture", ["Service Topology", "Shared Modules"]),
    successCriteria: [
      "Every service has an owner, contract, and forbidden dependency list.",
      "Legacy compatibility paths are deleted, isolated, or assigned a sunset date.",
      "Runtime call graph matches the documented topology.",
    ],
  };
}

function buildScalingDirective(context: RemediationContext): RecoveryDirective {
  const evidence = evidenceForDomain(context, "scaling");
  const severity = maxSeverity(
    severityFromWeight(context.domainWeights.scaling),
    context.projectedFailureRate > 76 ? "critical" : "medium",
  );

  return {
    domain: "scaling",
    title: "Install scaling containment",
    action:
      "Add backpressure, queue saturation alerts, concurrency ceilings, and capacity rehearsals before traffic expansion resumes.",
    rationale:
      "Scaling should not multiply ambiguity; it must expose pressure early and degrade deliberately.",
    severity,
    priority: severity === "critical" ? "urgent" : "high",
    ownerHint: "Runtime reliability",
    evidence,
    targetSystems: targetSystems(context, "scaling", ["Queue Workers", "Data Layer"]),
    successCriteria: [
      "Queue depth, worker saturation, and downstream timeout budgets have release gates.",
      "Peak replay drills prove the system sheds load before cascading.",
      "Autoscaling rules are tied to business-safe throughput ceilings.",
    ],
  };
}

function buildRetryDirective(context: RemediationContext): RecoveryDirective {
  const evidence = evidenceForDomain(context, "retry");
  const severity = maxSeverity(
    severityFromWeight(context.domainWeights.retry),
    evidence.length > 1 ? "high" : "medium",
  );

  return {
    domain: "retry",
    title: "Normalize retry and replay policy",
    action:
      "Create one retry budget, one idempotency verdict, and one dead-letter replay protocol across live handlers and background workers.",
    rationale:
      "Retry inconsistency turns recovery logic into a failure amplifier when pressure crosses service boundaries.",
    severity,
    priority: severity === "critical" ? "urgent" : "high",
    ownerHint: "Platform reliability",
    evidence,
    targetSystems: targetSystems(context, "retry", ["Queue Workers", "API Gateway"]),
    successCriteria: [
      "All retries carry idempotency keys and first-failure cause.",
      "Dead-letter replay requires validation and authorization proof.",
      "Retry storms trigger circuit breakers before saturation.",
    ],
  };
}

function buildOwnershipDirective(context: RemediationContext): RecoveryDirective {
  const evidence = evidenceForDomain(context, "ownership");
  const severity = maxSeverity(
    severityFromWeight(context.domainWeights.ownership),
    context.contradictionSignals.length > 1 ? "high" : "medium",
  );

  return {
    domain: "ownership",
    title: "Resolve service ownership confusion",
    action:
      "Assign named owners for every service boundary, recovery path, and shared module that influences production behavior.",
    rationale:
      "Agent contradictions are useful as forensic evidence; unresolved ownership contradictions are release risk.",
    severity,
    priority: severity === "critical" ? "urgent" : "high",
    ownerHint: "Engineering leadership",
    evidence,
    targetSystems: targetSystems(context, "ownership", context.services.slice(0, 4)),
    successCriteria: [
      "Every vulnerable system has an owning team and escalation path.",
      "Shared modules require domain approval before behavior changes.",
      "Incident command can identify first owner within one handoff.",
    ],
  };
}

function buildApiDirective(context: RemediationContext): RecoveryDirective {
  const evidence = evidenceForDomain(context, "api");
  const severity = maxSeverity(severityFromWeight(context.domainWeights.api), "medium");

  return {
    domain: "api",
    title: "Stabilize API contracts",
    action:
      "Version unstable endpoints, freeze webhook payload semantics, and add compatibility tests for client-facing and internal callers.",
    rationale:
      "API instability is the public face of internal drift; it must be made boring before the rest of recovery can hold.",
    severity,
    priority: severity === "critical" ? "urgent" : "high",
    ownerHint: "API platform",
    evidence,
    targetSystems: targetSystems(context, "api", ["API Gateway", "Webhook Adapter"]),
    successCriteria: [
      "Contract changes require compatibility tests and migration notes.",
      "Webhook payloads are versioned and schema-validated.",
      "Internal callers stop depending on private route behavior.",
    ],
  };
}

function buildCascadeDirective(context: RemediationContext): RecoveryDirective {
  const evidence = evidenceForDomain(context, "cascade");
  const severity = maxSeverity(
    severityFromWeight(context.domainWeights.cascade),
    context.riskScore > 82 ? "critical" : "medium",
  );

  return {
    domain: "cascade",
    title: "Break cascading failure paths",
    action:
      "Introduce circuit breakers, dependency timeouts, bulkheads, and blast-radius alerts around high-exposure service communication.",
    rationale:
      "Cascading failure prevention turns collapse into containment: one bad decision should not become a platform-wide event.",
    severity,
    priority: severity === "critical" ? "urgent" : "high",
    ownerHint: "Site reliability",
    evidence,
    targetSystems: targetSystems(context, "cascade", context.services.slice(0, 5)),
    successCriteria: [
      "Downstream failures trip bulkheads instead of spreading retries.",
      "Critical paths have explicit timeout and fallback budgets.",
      "Blast-radius dashboards identify propagation within minutes.",
    ],
  };
}

function buildObservabilityDirective(context: RemediationContext): RecoveryDirective {
  const evidence = evidenceForDomain(context, "observability");
  const severity = maxSeverity(severityFromWeight(context.domainWeights.observability), "medium");

  return {
    domain: "observability",
    title: "Restore first-failure observability",
    action:
      "Add trace correlation, recovery-decision logging, and first-failure markers across auth, API, worker, and dependency boundaries.",
    rationale:
      "Recovery fails when telemetry reports symptoms instead of causality; the system needs to preserve the first fracture.",
    severity,
    priority: severity === "critical" ? "urgent" : "high",
    ownerHint: "Observability platform",
    evidence,
    targetSystems: targetSystems(context, "observability", ["Observability Pipeline", "Incident Command"]),
    successCriteria: [
      "Every recovery action emits correlation id, owner, and original failure cause.",
      "Dashboards distinguish retry symptoms from first failure.",
      "Deployment, auth, API, and worker traces share one incident timeline.",
    ],
  };
}

function buildPriorityActions(
  context: RemediationContext,
  directives: RecoveryDirective[],
): PriorityAction[] {
  return directives.map((directive, index) => {
    const horizon = horizonForDirective(directive, index);

    return {
      id: createId("action", `${directive.domain}-${index}`),
      title: directive.title,
      description: `${directive.action} ${directive.rationale}`,
      domain: directive.domain,
      priority: directive.priority,
      horizon,
      severity: directive.severity,
      ownerHint: directive.ownerHint,
      blocksRelease:
        directive.priority === "urgent" ||
        directive.severity === "critical" ||
        criticalDomains().includes(directive.domain),
      evidence: directive.evidence.slice(0, 5),
      successCriteria: directive.successCriteria,
    };
  });
}

function buildStabilizationStrategies(
  context: RemediationContext,
  directives: RecoveryDirective[],
): StabilizationStrategy[] {
  return directives.slice(0, 8).map((directive, index) => ({
    id: createId("strategy", `${directive.domain}-${index}`),
    domain: directive.domain,
    title: strategyTitle(directive.domain),
    objective: directive.action,
    severity: directive.severity,
    confidence: confidenceForDirective(context, directive),
    executionNotes: executionNotesFor(directive.domain),
    successSignals: directive.successCriteria,
    ownerHint: directive.ownerHint,
  }));
}

function buildRecoveryTimeline(
  context: RemediationContext,
  actions: PriorityAction[],
): RecoveryTimelinePhase[] {
  const immediate = actions.filter((action) => action.horizon === "immediate");
  const shortTerm = actions.filter((action) => action.horizon === "short-term");
  const longTerm = actions.filter((action) => action.horizon === "long-term");

  return [
    {
      id: "phase-1-emergency-stabilization",
      phase: "Phase 1: Emergency stabilization",
      objective:
        "Stop the collapse corridor from widening while preserving enough system behavior for controlled repair.",
      timeframe: "0-72 hours",
      commandPosture: "Release gate active, incident command assigned, high-risk paths frozen.",
      actions: ensureActionTitles(immediate, actions.slice(0, 3)),
      exitCriteria: [
        "Critical auth, validation, retry, and dependency risks have owners.",
        "Release gate has explicit go/no-go criteria.",
        "Operational dashboards show first-failure causality for the top pressure zones.",
      ],
      riskReduction: clampScore(18 + immediate.length * 7 + (context.severity === "critical" ? 8 : 0)),
    },
    {
      id: "phase-2-architectural-containment",
      phase: "Phase 2: Architectural containment",
      objective:
        "Contain drift by making trust, validation, dependency, and retry boundaries explicit and testable.",
      timeframe: "3-14 days",
      commandPosture: "Boundary repair squad operating under architecture review.",
      actions: ensureActionTitles(shortTerm, actions.slice(1, 5)),
      exitCriteria: [
        "Canonical auth and validation paths are enforced.",
        "Dependency parity checks run in CI.",
        "Service communication avoids undeclared shared internals.",
      ],
      riskReduction: clampScore(24 + shortTerm.length * 6),
    },
    {
      id: "phase-3-service-normalization",
      phase: "Phase 3: Service normalization",
      objective:
        "Normalize service ownership, API contracts, recovery behavior, and runtime capacity expectations.",
      timeframe: "2-6 weeks",
      commandPosture: "Service owners accountable for contracts and recovery drills.",
      actions: ensureActionTitles(
        actions.filter((action) => action.domain === "ownership" || action.domain === "api"),
        shortTerm,
      ),
      exitCriteria: [
        "Every vulnerable service has a named owner and escalation route.",
        "API and webhook contracts are versioned.",
        "Capacity and replay tests are part of release readiness.",
      ],
      riskReduction: clampScore(20 + context.services.length * 2),
    },
    {
      id: "phase-4-resilience-hardening",
      phase: "Phase 4: Long-term resilience hardening",
      objective:
        "Convert the recovery operation into durable governance, observability, and deployment safeguards.",
      timeframe: "6-12 weeks",
      commandPosture: "Continuous forensic monitoring with governance guardrails.",
      actions: ensureActionTitles(longTerm, actions.slice(-3)),
      exitCriteria: [
        "Architecture drift has automated detection.",
        "Deployment safeguards block recurrence of known collapse vectors.",
        "Incident reviews produce prevention controls, not only local fixes.",
      ],
      riskReduction: clampScore(16 + longTerm.length * 5 + Math.floor(context.evidenceCompleteness / 10)),
    },
  ];
}

function buildArchitectureRecommendations(
  context: RemediationContext,
  directives: RecoveryDirective[],
): ArchitectureRecommendation[] {
  return directives
    .filter((directive) =>
      ["authentication", "dependencies", "validation", "architecture", "scaling", "retry", "ownership", "api"].includes(
        directive.domain,
      ),
    )
    .map((directive, index) => ({
      id: createId("architecture-rec", `${directive.domain}-${index}`),
      domain: directive.domain,
      title: architectureRecommendationTitle(directive.domain),
      recommendation: architectureRecommendationFor(directive.domain),
      rationale: directive.rationale,
      targetSystems: directive.targetSystems,
      expectedImpact: expectedImpactFor(directive.domain, context),
      priority: directive.priority,
    }));
}

function buildPreventionMeasures(
  context: RemediationContext,
  directives: RecoveryDirective[],
): PreventionMeasure[] {
  const domains = uniqueDomains([
    ...directives.map((directive) => directive.domain),
    "observability",
    "cascade",
  ]);

  return domains.slice(0, 10).map((domain, index) => ({
    id: createId("prevention", `${domain}-${index}`),
    domain,
    title: preventionTitle(domain),
    measure: preventionMeasureFor(domain),
    governanceSignal: governanceSignalFor(domain),
    observabilitySignal: observabilitySignalFor(domain),
    deploymentSafeguard: deploymentSafeguardFor(domain, context),
  }));
}

function buildCompatibilityRecommendations(actions: PriorityAction[]): Recommendation[] {
  return actions.slice(0, 8).map((action) => ({
    id: action.id.replace("action", "rec"),
    title: action.title,
    description: action.description,
    priority: action.priority,
    ownerHint: action.ownerHint,
    relatedRiskIds: relatedRiskIdsFor(action.domain),
  }));
}

function buildConfidence(
  context: RemediationContext,
  directives: RecoveryDirective[],
): RemediationConfidence {
  const directiveConfidence =
    directives.length > 0
      ? average(directives.map((directive) => confidenceForDirective(context, directive)))
      : 58;
  const recoveryPenalty = context.severity === "critical" ? 8 : context.severity === "high" ? 4 : 0;

  return {
    remediationConfidence: clampScore((directiveConfidence + context.evidenceCompleteness) / 2 + 8),
    recoveryFeasibility: clampScore(
      100 -
        context.riskScore / 2 -
        recoveryPenalty +
        Math.min(context.stabilityScore / 3, 22) +
        Math.min(context.integrityScore / 4, 18),
    ),
    stabilizationProbability: clampScore(
      72 -
        context.projectedFailureRate / 4 +
        directives.filter((directive) => directive.priority === "urgent").length * 3 +
        context.evidenceCompleteness / 5,
    ),
    evidenceCompleteness: context.evidenceCompleteness,
    method: "heuristic",
  };
}

function shouldGateRelease(context: RemediationContext, actions: PriorityAction[]): boolean {
  return (
    context.riskScore >= 75 ||
    context.severity === "critical" ||
    actions.some((action) => action.blocksRelease && action.priority === "urgent")
  );
}

function buildSummary(
  context: RemediationContext,
  directives: RecoveryDirective[],
  releaseGateRequired: boolean,
): string {
  const lead = directives[0];
  const gate = releaseGateRequired
    ? "Release gating is required until recovery invariants are restored."
    : "Release gating is advisory, but recovery controls should be installed before expansion.";

  return `GHOST TRACE recovery command classifies the system as ${context.severity.toUpperCase()} remediation priority at ${context.riskScore}% risk. ${
    lead
      ? `${lead.title} is the first operation: ${lead.rationale}`
      : "Sparse intelligence requires conservative stabilization before deeper recovery."
  } ${gate}`;
}

function buildMissionObjective(context: RemediationContext): string {
  if (context.severity === "critical") {
    return "Prevent engineering collapse by freezing unstable release paths, restoring trust boundaries, and containing cascading runtime pressure.";
  }

  if (context.severity === "high") {
    return "Stabilize the system before risk escalates from architecture drift into production incident repetition.";
  }

  return "Convert visible instability into durable architecture controls before the next pressure event.";
}

function commandPosture(context: RemediationContext): string {
  if (context.severity === "critical") {
    return "Emergency recovery posture: release gate active, owner assignment mandatory, runtime containment prioritized over feature delivery.";
  }

  if (context.severity === "high") {
    return "Stabilization posture: restrict risky changes, repair boundaries, and require architecture review for cross-domain work.";
  }

  return "Preventive posture: harden weak boundaries while normal delivery continues under increased observability.";
}

async function tryGenerateAiRemediation(
  input: RemediationEngineInput,
  context: RemediationContext,
  provider: RemediationAiProvider,
): Promise<Partial<RemediationIntelligence> | null> {
  try {
    const report = await provider.generateRemediation(input, context);

    if (!report) {
      return null;
    }

    if (typeof report === "string") {
      return JSON.parse(stripJsonFence(report)) as Partial<RemediationIntelligence>;
    }

    return report;
  } catch {
    return null;
  }
}

function mergeRemediation(
  heuristic: RemediationIntelligence,
  aiReport: Partial<RemediationIntelligence>,
): RemediationIntelligence {
  const remediationPlan = aiReport.remediationPlan ?? heuristic.remediationPlan;
  const recommendations = validArray(aiReport.recommendations) ?? remediationPlan.recommendations ?? heuristic.recommendations;
  const priorityOrder = validArray(aiReport.priorityOrder) ?? remediationPlan.priorityOrder ?? heuristic.priorityOrder;
  const releaseGateRequired =
    typeof aiReport.releaseGateRequired === "boolean"
      ? aiReport.releaseGateRequired
      : remediationPlan.releaseGateRequired;

  return {
    remediationPlan: {
      ...remediationPlan,
      recommendations,
      priorityOrder,
      releaseGateRequired,
    },
    stabilizationStrategies:
      validArray(aiReport.stabilizationStrategies) ?? heuristic.stabilizationStrategies,
    priorityActions: validArray(aiReport.priorityActions) ?? heuristic.priorityActions,
    recoveryTimeline: validArray(aiReport.recoveryTimeline) ?? heuristic.recoveryTimeline,
    architectureRecommendations:
      validArray(aiReport.architectureRecommendations) ?? heuristic.architectureRecommendations,
    preventionMeasures: validArray(aiReport.preventionMeasures) ?? heuristic.preventionMeasures,
    confidence: {
      ...heuristic.confidence,
      ...aiReport.confidence,
      method: "ai-assisted",
      remediationConfidence: clampScore(
        aiReport.confidence?.remediationConfidence ??
          heuristic.confidence.remediationConfidence,
      ),
      recoveryFeasibility: clampScore(
        aiReport.confidence?.recoveryFeasibility ??
          heuristic.confidence.recoveryFeasibility,
      ),
      stabilizationProbability: clampScore(
        aiReport.confidence?.stabilizationProbability ??
          heuristic.confidence.stabilizationProbability,
      ),
      evidenceCompleteness: clampScore(
        aiReport.confidence?.evidenceCompleteness ??
          heuristic.confidence.evidenceCompleteness,
      ),
    },
    summary: aiReport.summary ?? remediationPlan.summary,
    recommendations,
    releaseGateRequired,
    priorityOrder,
  };
}

export function generateFallbackRemediation(
  error?: unknown,
  options: RemediationOptions = {},
): RemediationIntelligence {
  const reason =
    error instanceof Error
      ? error.message
      : "live remediation generation returned incomplete intelligence";
  const now = resolveNow(options);
  const recommendations: Recommendation[] = [
    {
      id: "rec-fallback-release-gate",
      title: "Activate emergency recovery gate",
      description:
        "Freeze high-risk release paths while the recovery engine restores trust, validation, dependency, and retry control points.",
      priority: "urgent",
      ownerHint: "Engineering command",
      relatedRiskIds: ["risk-overall", "risk-failure-rate"],
    },
    {
      id: "rec-fallback-auth-control",
      title: "Centralize trust authority",
      description:
        "Route all authorization decisions through one canonical authority before scaling propagation can amplify inconsistent session verdicts.",
      priority: "urgent",
      ownerHint: "Security platform",
      relatedRiskIds: ["risk-security-exposure", "risk-integrity"],
    },
    {
      id: "rec-fallback-retry-containment",
      title: "Contain retry amplification",
      description:
        "Install retry budgets, idempotency checks, and dead-letter replay controls around queue and worker surfaces.",
      priority: "high",
      ownerHint: "Runtime reliability",
      relatedRiskIds: ["risk-scaling-pressure", "risk-failure-rate"],
    },
  ];
  const priorityActions: PriorityAction[] = [
    {
      id: "action-fallback-release-gate",
      title: "Stand up recovery command",
      description:
        "Live remediation failed, so GHOST TRACE entered fallback recovery mode. Assign incident command and freeze unstable delivery paths.",
      domain: "cascade",
      priority: "urgent",
      horizon: "immediate",
      severity: "critical",
      ownerHint: "Engineering leadership",
      blocksRelease: true,
      evidence: [`Fallback activated: ${reason}`, `Generated at ${now}`],
      successCriteria: [
        "Recovery owner assigned.",
        "Release gate active.",
        "Top instability zones have named responders.",
      ],
    },
    {
      id: "action-fallback-auth-validation",
      title: "Restore trust and validation boundaries",
      description:
        "Centralize authentication and validation decisions before downstream services continue processing ambiguous events.",
      domain: "authentication",
      priority: "urgent",
      horizon: "immediate",
      severity: "critical",
      ownerHint: "Security platform",
      blocksRelease: true,
      evidence: ["Fallback trust-boundary reconstruction", "Fragmented validation risk"],
      successCriteria: [
        "One auth authority identified.",
        "Canonical schemas assigned.",
        "Replay paths require validation proof.",
      ],
    },
    {
      id: "action-fallback-runtime",
      title: "Normalize runtime recovery behavior",
      description:
        "Freeze dependencies and retry policies until production parity and replay safety are verified.",
      domain: "retry",
      priority: "high",
      horizon: "short-term",
      severity: "high",
      ownerHint: "Platform reliability",
      blocksRelease: true,
      evidence: ["Dependency volatility risk", "Retry amplification risk"],
      successCriteria: [
        "Dependency graph locked.",
        "Retry budgets defined.",
        "Dead-letter replay capped.",
      ],
    },
  ];
  const remediationPlan: RemediationPlan = {
    summary:
      "GHOST TRACE remediation switched to cinematic fallback mode. The recovery operation remains active: freeze unstable releases, centralize trust authority, rebuild validation boundaries, and contain retry amplification.",
    missionObjective:
      "Preserve the immersive recovery operation while live AI remediation is unavailable, then restore full analysis once telemetry returns.",
    commandPosture:
      "Fallback emergency posture: assume trust-boundary instability until live evidence proves containment.",
    releaseGateRequired: true,
    recommendations,
    priorityOrder: priorityActions.map((action) => action.id),
  };

  return {
    remediationPlan,
    stabilizationStrategies: [
      {
        id: "strategy-fallback-command",
        domain: "cascade",
        title: "Fallback recovery command",
        objective:
          "Keep the system in controlled recovery posture while live remediation intelligence is restored.",
        severity: "critical",
        confidence: 82,
        executionNotes: [
          "Treat fallback as conservative, not decorative.",
          "Do not resume risky release paths until live evidence validates recovery.",
        ],
        successSignals: ["Release gate active", "Owners assigned", "Live analysis restored"],
        ownerHint: "Engineering command",
      },
    ],
    priorityActions,
    recoveryTimeline: buildFallbackTimeline(priorityActions),
    architectureRecommendations: [
      {
        id: "architecture-rec-fallback-boundary",
        domain: "authentication",
        title: "Recover the control plane",
        recommendation:
          "Centralize authentication, validation, and retry authority before architecture work resumes.",
        rationale:
          "Fallback intelligence cannot safely distinguish cosmetic instability from active control-plane failure.",
        targetSystems: ["Auth Service", "API Gateway", "Queue Workers"],
        expectedImpact:
          "Restores the minimum architecture spine needed for reliable forensic analysis.",
        priority: "urgent",
      },
    ],
    preventionMeasures: [
      {
        id: "prevention-fallback-analysis-health",
        domain: "observability",
        title: "Monitor remediation engine health",
        measure:
          "Alert when live AI remediation fails and annotate all generated plans with fallback status.",
        governanceSignal: "Fallback plans require human recovery-owner acknowledgement.",
        observabilitySignal: "Provider failures and fallback activations are traced.",
        deploymentSafeguard: "High-risk deployment cannot proceed on fallback-only recovery evidence.",
      },
    ],
    confidence: {
      remediationConfidence: 78,
      recoveryFeasibility: 64,
      stabilizationProbability: 72,
      evidenceCompleteness: 34,
      method: "cinematic-fallback",
    },
    summary: remediationPlan.summary,
    recommendations,
    releaseGateRequired: true,
    priorityOrder: remediationPlan.priorityOrder,
  };
}

function fallbackDirectives(context: RemediationContext): RecoveryDirective[] {
  return [
    buildAuthenticationDirective(context),
    buildArchitectureDirective(context),
    buildObservabilityDirective(context),
  ];
}

function normalizeArchitecture(value: unknown): Partial<ArchitectureReport> {
  const record = isRecord(value) ? value : {};

  return {
    detectedServices: readStringArray(record.detectedServices),
    nodes: Array.isArray(record.nodes)
      ? record.nodes.filter(isRecord).map((node, index) => ({
          id: readString(node.id) ?? createId("node", index),
          name: readString(node.name) ?? `Service ${index + 1}`,
          type: readString(node.type) as ArchitectureReport["nodes"][number]["type"],
          service: readString(node.service),
          path: readString(node.path),
          severity: normalizeSeverity(node.severity),
          healthScore: readNumber(node.healthScore),
          duplicated: typeof node.duplicated === "boolean" ? node.duplicated : undefined,
          suspiciousPatterns: readStringArray(node.suspiciousPatterns),
          metadata: isRecord(node.metadata) ? node.metadata : undefined,
        }))
      : [],
    connections: [],
    dependencies: readStringArray(record.dependencies),
    duplicatedModules: readStringArray(record.duplicatedModules),
    suspiciousPatterns: readStringArray(record.suspiciousPatterns),
    architectureDrift: readStringArray(record.architectureDrift),
    frontendStructure: readString(record.frontendStructure),
    backendStructure: readString(record.backendStructure),
    dependencyConcerns: readStringArray(record.dependencyConcerns),
    summary: readString(record.summary),
    metadata: isRecord(record.metadata) ? record.metadata : undefined,
  };
}

function normalizeRisk(value: unknown): {
  riskScore: number;
  stabilityScore: number;
  integrityScore: number;
  projectedFailureRate: number;
  severity: RiskSeverity;
} {
  const record = isRecord(value) ? value : {};
  const riskScore = clampScore(
    readNumber(record.riskScore) ??
      readNumber(record.overallRisk) ??
      readNumber(record.failureProbability) ??
      62,
  );
  const stabilityScore = clampScore(readNumber(record.stabilityScore) ?? 100 - riskScore);
  const integrityScore = clampScore(readNumber(record.integrityScore) ?? 76 - riskScore / 4);
  const projectedFailureRate = clampScore(
    readNumber(record.projectedFailureRate) ?? readNumber(record.failureProbability) ?? riskScore - 6,
  );

  return {
    riskScore,
    stabilityScore,
    integrityScore,
    projectedFailureRate,
    severity: normalizeSeverity(record.severity) ?? scoreToSeverity(riskScore),
  };
}

function normalizeTimeline(values: unknown[]): TimelineEvent[] {
  return values.filter(isRecord).map((event, index) => ({
    id: readString(event.id) ?? createId("timeline", index),
    title: readString(event.title) ?? "Recovery timeline signal",
    timestamp: readString(event.timestamp) ?? `T+00:${String(index).padStart(2, "0")}:00`,
    severity: normalizeSeverity(event.severity) ?? "medium",
    description:
      readString(event.description) ??
      "Timeline signal supplied without description; remediation engine preserved it as recovery context.",
    metadata: isRecord(event.metadata) ? event.metadata : undefined,
  }));
}

function normalizeVulnerableSystems(value: unknown): VulnerableSystemInput[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(isRecord).map((system, index) => ({
    id: readString(system.id) ?? createId("vulnerable", index),
    name: readString(system.name) ?? `Vulnerable System ${index + 1}`,
    type: readString(system.type),
    severity: normalizeSeverity(system.severity),
    exposureScore: readNumber(system.exposureScore),
    weakPoints: readStringArray(system.weakPoints),
    evidence: readStringArray(system.evidence),
    forecast: readString(system.forecast),
  }));
}

function normalizePredictedFailures(value: unknown): PredictedFailure[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(isRecord).map((failure, index) => ({
    id: readString(failure.id) ?? createId("failure", index),
    title: readString(failure.title) ?? "Predicted engineering failure",
    probability: clampScore(readNumber(failure.probability) ?? 64),
    severity: normalizeSeverity(failure.severity) ?? "high",
    description:
      readString(failure.description) ??
      "Failure prediction supplied without description; remediation engine preserved it.",
    trigger: readString(failure.trigger),
    impactedServices: readStringArray(failure.impactedServices),
    evidenceIds: readStringArray(failure.evidenceIds),
  }));
}

function normalizeContradictions(values: unknown): AgentContradictionInput[] {
  if (!Array.isArray(values)) {
    return [];
  }

  return values.filter(isRecord).map((contradiction, index) => ({
    id: readString(contradiction.id) ?? createId("contradiction", index),
    challenger: readString(contradiction.challenger),
    target: readString(contradiction.target),
    topic: readString(contradiction.topic),
    claim: readString(contradiction.claim),
    counterClaim: readString(contradiction.counterClaim),
    evidenceIds: readStringArray(contradiction.evidenceIds),
    severity: normalizeSeverity(contradiction.severity),
    confidence: readNumber(contradiction.confidence),
  }));
}

function uniqueContradictions(values: AgentContradictionInput[]): AgentContradictionInput[] {
  const seen = new Set<string>();

  return values.filter((value, index) => {
    const key = value.id ?? `${value.topic ?? "topic"}-${value.claim ?? index}`;

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function extractForensicSignals(value: unknown): string[] {
  if (!value) {
    return [];
  }

  if (typeof value === "string") {
    return [value];
  }

  if (Array.isArray(value)) {
    return value.flatMap(extractForensicSignals);
  }

  if (!isRecord(value)) {
    return [];
  }

  return uniqueStrings([
    readString(value.summary),
    ...readStringArray(value.forensicFindings),
    ...readStringArray(value.instabilitySignals),
    ...readStringArray(value.suspiciousPatterns),
    ...readStringArray(value.architectureFindings),
    ...extractNestedSignalText(value.evidence),
    ...extractNestedSignalText(value.engineeringAssessment),
  ]);
}

function extractNestedSignalText(value: unknown): string[] {
  if (!value) {
    return [];
  }

  if (typeof value === "string") {
    return [value];
  }

  if (Array.isArray(value)) {
    return value.flatMap(extractNestedSignalText);
  }

  if (!isRecord(value)) {
    return [];
  }

  return Object.values(value).flatMap((item) =>
    typeof item === "string" || Array.isArray(item) || isRecord(item)
      ? extractNestedSignalText(item)
      : [],
  );
}

function scoreDomains(signals: string[]): Record<RemediationDomain, number> {
  const weights = emptyDomainWeights();

  for (const signal of signals) {
    const normalized = signal.toLowerCase();

    for (const [domain, terms] of Object.entries(DOMAIN_TERMS) as Array<
      [RemediationDomain, string[]]
    >) {
      if (terms.some((term) => normalized.includes(term))) {
        weights[domain] += 1;
      }
    }
  }

  return weights;
}

function calculateEvidenceCompleteness(input: {
  findings: string[];
  services: string[];
  dependencies: string[];
  timeline: TimelineEvent[];
  vulnerableSystems: VulnerableSystemInput[];
  predictedFailures: PredictedFailure[];
  contradictions: AgentContradictionInput[];
}): number {
  const dimensions = [
    input.findings.length > 0,
    input.services.length > 0,
    input.dependencies.length > 0,
    input.timeline.length > 0,
    input.vulnerableSystems.length > 0,
    input.predictedFailures.length > 0,
    input.contradictions.length > 0,
  ];

  return clampScore((dimensions.filter(Boolean).length / dimensions.length) * 100);
}

function evidenceForDomain(context: RemediationContext, domain: RemediationDomain): string[] {
  return uniqueStrings([
    ...context.findings.filter((signal) => includesDomain(signal, domain)),
    ...context.vulnerableSystems
      .filter((system) =>
        includesDomain(`${system.name ?? ""} ${(system.weakPoints ?? []).join(" ")} ${system.forecast ?? ""}`, domain),
      )
      .flatMap((system) => [system.name ?? "", ...(system.weakPoints ?? []), ...(system.evidence ?? [])]),
    ...context.predictedFailures
      .filter((failure) => includesDomain(`${failure.title} ${failure.description} ${failure.trigger ?? ""}`, domain))
      .map((failure) => failure.title),
  ]).slice(0, 8);
}

function targetSystems(
  context: RemediationContext,
  domain: RemediationDomain,
  fallback: string[],
): string[] {
  const domainTargets = context.services.filter((service) => includesDomain(service, domain));
  const vulnerableTargets = context.vulnerableSystems
    .filter((system) => includesDomain(`${system.name ?? ""} ${(system.weakPoints ?? []).join(" ")}`, domain))
    .map((system) => system.name ?? "");

  return uniqueStrings([...domainTargets, ...vulnerableTargets, ...fallback]).slice(0, 6);
}

function includesDomain(value: string, domain: RemediationDomain): boolean {
  const normalized = value.toLowerCase();
  return DOMAIN_TERMS[domain].some((term) => normalized.includes(term));
}

function severityFromWeight(weight: number): RiskSeverity {
  if (weight >= 7) {
    return "critical";
  }

  if (weight >= 4) {
    return "high";
  }

  if (weight >= 2) {
    return "medium";
  }

  return "low";
}

function confidenceForDirective(
  context: RemediationContext,
  directive: RecoveryDirective,
): number {
  return clampScore(
    58 +
      context.domainWeights[directive.domain] * 5 +
      directive.evidence.length * 3 +
      context.evidenceCompleteness / 5,
  );
}

function horizonForDirective(directive: RecoveryDirective, index: number): RecoveryHorizon {
  if (directive.priority === "urgent" || directive.severity === "critical" || index < 2) {
    return "immediate";
  }

  if (
    directive.domain === "architecture" ||
    directive.domain === "ownership" ||
    directive.domain === "api"
  ) {
    return "short-term";
  }

  return "long-term";
}

function strategyTitle(domain: RemediationDomain): string {
  const titles: Record<RemediationDomain, string> = {
    authentication: "Trust boundary recovery strategy",
    dependencies: "Dependency containment strategy",
    validation: "Validation perimeter restoration",
    architecture: "Architecture drift containment",
    scaling: "Scaling resilience operation",
    retry: "Retry normalization operation",
    ownership: "Service command clarification",
    api: "API contract stabilization",
    cascade: "Cascade containment strategy",
    observability: "First-failure observability recovery",
  };

  return titles[domain];
}

function executionNotesFor(domain: RemediationDomain): string[] {
  const notes: Record<RemediationDomain, string[]> = {
    authentication: [
      "Start with authorization verdict ownership, then migrate callers.",
      "Do not keep fallback auth paths without explicit expiry.",
    ],
    dependencies: [
      "Stabilize lockfiles before adapter refactors.",
      "Compare API and worker runtime graphs in the same CI job.",
    ],
    validation: [
      "Treat schemas as contracts, not helper utilities.",
      "Reject replay payloads that cannot prove canonical ingress validation.",
    ],
    architecture: [
      "Map the runtime graph before deleting legacy compatibility paths.",
      "Turn architecture decisions into enforceable dependency rules.",
    ],
    scaling: [
      "Add backpressure before increasing worker concurrency.",
      "Run replay drills against realistic downstream latency.",
    ],
    retry: [
      "Retry budgets must be lower than saturation thresholds.",
      "Dead-letter replay should require authorization and validation context.",
    ],
    ownership: [
      "Assign service owners before assigning remediation tasks.",
      "Make cross-domain behavior reviewable by both owning teams.",
    ],
    api: [
      "Version before changing semantics.",
      "Contract tests should represent internal and external callers.",
    ],
    cascade: [
      "Contain high-exposure dependencies with bulkheads.",
      "Make fallback behavior explicit rather than emergent.",
    ],
    observability: [
      "Preserve original failure cause through retries.",
      "Link deployment, API, worker, and auth traces into one incident story.",
    ],
  };

  return notes[domain];
}

function ensureActionTitles(actions: PriorityAction[], fallback: PriorityAction[]): string[] {
  const selected = actions.length > 0 ? actions : fallback;
  return selected.slice(0, 5).map((action) => action.title);
}

function architectureRecommendationTitle(domain: RemediationDomain): string {
  const titles: Record<RemediationDomain, string> = {
    authentication: "Centralize auth boundary",
    dependencies: "Isolate dependency volatility",
    validation: "Restructure validation layers",
    architecture: "Redesign modular ownership",
    scaling: "Improve scaling resilience",
    retry: "Normalize retry control",
    ownership: "Clarify service command",
    api: "Stabilize API organization",
    cascade: "Install failure bulkheads",
    observability: "Recover causal telemetry",
  };

  return titles[domain];
}

function architectureRecommendationFor(domain: RemediationDomain): string {
  const recommendations: Record<RemediationDomain, string> = {
    authentication:
      "Move auth decisions behind a single policy service or module with shared session, revocation, and role sources.",
    dependencies:
      "Separate volatile third-party dependencies from domain logic behind owned adapters and parity checks.",
    validation:
      "Create one validation contract layer at ingress and require asynchronous consumers to process validated envelopes.",
    architecture:
      "Refactor shared modules into domain-owned packages with explicit dependency direction and architecture tests.",
    scaling:
      "Add backpressure, queue partitioning, capacity budgets, and saturation alarms to high-throughput paths.",
    retry:
      "Use one retry policy library with idempotency, jitter, circuit breaking, and dead-letter governance.",
    ownership:
      "Publish service ownership metadata and require owners to approve cross-boundary behavior changes.",
    api:
      "Group API routes by contract owner, version external contracts, and reject unowned endpoint expansion.",
    cascade:
      "Wrap critical downstream calls with bulkheads, fallback policy, and blast-radius limits.",
    observability:
      "Instrument first-failure markers and correlation ids through every recovery decision.",
  };

  return recommendations[domain];
}

function expectedImpactFor(domain: RemediationDomain, context: RemediationContext): string {
  const highPressure = context.domainWeights[domain] > 3 || context.riskScore > 75;
  const prefix = highPressure ? "High impact" : "Moderate impact";

  return `${prefix}: reduces ${domain} instability and improves recovery confidence across ${context.services
    .slice(0, 3)
    .join(", ") || "critical service zones"}.`;
}

function preventionTitle(domain: RemediationDomain): string {
  return `${titleCase(domain)} recurrence prevention`;
}

function preventionMeasureFor(domain: RemediationDomain): string {
  const measures: Record<RemediationDomain, string> = {
    authentication:
      "Require architecture approval for any new auth adapter, session source, or role evaluation path.",
    dependencies:
      "Track dependency drift with automated parity checks across frontend, API, and worker packages.",
    validation:
      "Make schema ownership part of the API review process and block unvalidated ingress in CI.",
    architecture:
      "Run architecture drift detection on every release candidate and require owners for exceptions.",
    scaling:
      "Perform capacity drills before raising traffic, queue, or worker concurrency limits.",
    retry:
      "Enforce retry budgets, circuit breaker rules, and replay governance in shared runtime policy.",
    ownership:
      "Maintain service ownership metadata and require cross-domain review for shared behavior changes.",
    api:
      "Require contract tests and versioning plans for endpoint, webhook, or client-facing behavior changes.",
    cascade:
      "Continuously test bulkheads and fallback behavior against downstream failure simulations.",
    observability:
      "Monitor first-failure causality, correlation coverage, and incident timeline completeness.",
  };

  return measures[domain];
}

function governanceSignalFor(domain: RemediationDomain): string {
  const signals: Record<RemediationDomain, string> = {
    authentication: "Auth boundary changes require security-owner approval.",
    dependencies: "Dependency upgrades require runtime parity evidence.",
    validation: "Ingress schema changes require API-owner approval.",
    architecture: "Architecture exceptions require expiration and owner.",
    scaling: "Capacity increases require load-test evidence.",
    retry: "Retry policy changes require reliability-owner review.",
    ownership: "Unowned services cannot pass release readiness.",
    api: "API changes require contract compatibility proof.",
    cascade: "High-blast-radius paths require resilience review.",
    observability: "Critical paths require trace and first-failure coverage.",
  };

  return signals[domain];
}

function observabilitySignalFor(domain: RemediationDomain): string {
  const signals: Record<RemediationDomain, string> = {
    authentication: "Authorization verdict source, session id, and role context traced.",
    dependencies: "Runtime package fingerprint emitted during startup and deployment.",
    validation: "Validation result and schema version attached to ingress traces.",
    architecture: "Cross-domain calls and forbidden dependency attempts logged.",
    scaling: "Queue depth, worker saturation, and downstream latency tracked together.",
    retry: "Retry attempt, budget, idempotency key, and first failure cause traced.",
    ownership: "Incident routes include service owner and escalation target.",
    api: "Contract version and caller class attached to endpoint telemetry.",
    cascade: "Bulkhead trips and fallback decisions emit blast-radius metadata.",
    observability: "Trace coverage and missing-causality gaps are measured directly.",
  };

  return signals[domain];
}

function deploymentSafeguardFor(domain: RemediationDomain, context: RemediationContext): string {
  const strict = context.riskScore > 75 ? "Block deployment if" : "Warn before deployment when";
  const safeguards: Record<RemediationDomain, string> = {
    authentication: `${strict} multiple auth authorities are detected.`,
    dependencies: `${strict} dependency parity differs between runtime surfaces.`,
    validation: `${strict} public ingress lacks canonical schema coverage.`,
    architecture: `${strict} architecture drift exceptions lack owner or expiry.`,
    scaling: `${strict} capacity tests fail replay or saturation thresholds.`,
    retry: `${strict} retry budgets or idempotency checks are missing.`,
    ownership: `${strict} service ownership metadata is incomplete.`,
    api: `${strict} contract compatibility tests are missing.`,
    cascade: `${strict} bulkhead and fallback simulations fail.`,
    observability: `${strict} first-failure telemetry coverage drops below target.`,
  };

  return safeguards[domain];
}

function relatedRiskIdsFor(domain: RemediationDomain): string[] {
  const ids: Record<RemediationDomain, string[]> = {
    authentication: ["risk-security-exposure", "risk-integrity"],
    dependencies: ["risk-dependency-volatility", "risk-failure-rate"],
    validation: ["risk-security-exposure", "risk-stability"],
    architecture: ["risk-integrity", "risk-overall"],
    scaling: ["risk-scaling-pressure", "risk-failure-rate"],
    retry: ["risk-scaling-pressure", "risk-failure-rate"],
    ownership: ["risk-integrity", "risk-overall"],
    api: ["risk-stability", "risk-overall"],
    cascade: ["risk-failure-rate", "risk-overall"],
    observability: ["risk-stability", "risk-overall"],
  };

  return ids[domain];
}

function buildFallbackTimeline(actions: PriorityAction[]): RecoveryTimelinePhase[] {
  return [
    {
      id: "phase-1-emergency-stabilization",
      phase: "Phase 1: Emergency stabilization",
      objective: "Freeze unstable delivery paths and restore recovery command.",
      timeframe: "0-72 hours",
      commandPosture: "Fallback emergency command active.",
      actions: actions.map((action) => action.title),
      exitCriteria: ["Release gate active", "Recovery owners assigned", "Live analysis restored"],
      riskReduction: 31,
    },
    {
      id: "phase-2-architectural-containment",
      phase: "Phase 2: Architectural containment",
      objective: "Contain trust, validation, dependency, and retry instability.",
      timeframe: "3-14 days",
      commandPosture: "Boundary recovery in progress.",
      actions: ["Centralize auth", "Rebuild validation", "Normalize retry policy"],
      exitCriteria: ["Canonical boundaries proven", "Runtime parity verified"],
      riskReduction: 27,
    },
    {
      id: "phase-3-service-normalization",
      phase: "Phase 3: Service normalization",
      objective: "Restore service ownership and API contract discipline.",
      timeframe: "2-6 weeks",
      commandPosture: "Service normalization squad active.",
      actions: ["Assign owners", "Version contracts", "Run replay drills"],
      exitCriteria: ["Service ownership complete", "API contracts stable"],
      riskReduction: 22,
    },
    {
      id: "phase-4-resilience-hardening",
      phase: "Phase 4: Long-term resilience hardening",
      objective: "Prevent recurrence with governance, observability, and deployment safeguards.",
      timeframe: "6-12 weeks",
      commandPosture: "Continuous resilience monitoring.",
      actions: ["Install drift detection", "Gate dependency parity", "Monitor first-failure telemetry"],
      exitCriteria: ["Automated safeguards active", "Incident causality preserved"],
      riskReduction: 18,
    },
  ];
}

function criticalDomains(): RemediationDomain[] {
  return ["authentication", "validation", "retry", "cascade"];
}

function uniqueDomains(values: RemediationDomain[]): RemediationDomain[] {
  return Array.from(new Set(values));
}

function priorityRank(priority: ActionPriority): number {
  const ranks: Record<ActionPriority, number> = {
    low: 1,
    medium: 2,
    high: 3,
    urgent: 4,
  };

  return ranks[priority];
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

function maxSeverity(left: RiskSeverity, right: RiskSeverity): RiskSeverity {
  const ranks: Record<RiskSeverity, number> = {
    low: 1,
    medium: 2,
    high: 3,
    critical: 4,
  };

  return ranks[left] >= ranks[right] ? left : right;
}

function normalizeSeverity(value: unknown): RiskSeverity | undefined {
  const normalized = typeof value === "string" ? value.toLowerCase() : "";

  if (normalized === "low" || normalized === "medium" || normalized === "high" || normalized === "critical") {
    return normalized;
  }

  if (normalized === "moderate") {
    return "medium";
  }

  return undefined;
}

function emptyDomainWeights(): Record<RemediationDomain, number> {
  return {
    authentication: 0,
    dependencies: 0,
    validation: 0,
    architecture: 0,
    scaling: 0,
    retry: 0,
    ownership: 0,
    api: 0,
    cascade: 0,
    observability: 0,
  };
}

function readUnknownArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function readArray(record: Record<string, unknown>, key: string): unknown[] {
  const value = record[key];
  return Array.isArray(value) ? value : [];
}

function readRecord(record: Record<string, unknown>, key: string): Record<string, unknown> | undefined {
  const value = record[key];
  return isRecord(value) ? value : undefined;
}

function readString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0 ? value : undefined;
}

function readNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function readStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
}

function validArray<T>(value: T[] | undefined): T[] | undefined {
  return Array.isArray(value) && value.length > 0 ? value : undefined;
}

function uniqueStrings(values: Array<string | undefined>): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const value of values) {
    const normalized = value?.trim();

    if (!normalized) {
      continue;
    }

    const key = normalized.toLowerCase();

    if (!seen.has(key)) {
      seen.add(key);
      result.push(normalized);
    }
  }

  return result;
}

function average(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }

  return clampScore(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function clampScore(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(value)));
}

function titleCase(value: string): string {
  return value
    .split("-")
    .map((part) => part.slice(0, 1).toUpperCase() + part.slice(1))
    .join(" ");
}

function stripJsonFence(content: string): string {
  return content
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();
}

function createId(prefix: string, seed: unknown): string {
  const slug = String(seed)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72);

  return `${prefix}-${slug || "unknown"}`;
}

function resolveNow(options: RemediationOptions): string {
  return options.now?.() ?? new Date().toISOString();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

async function asyncBoundary(): Promise<void> {
  await Promise.resolve();
}

export const remediation = {
  produceRemediation,
  generateRemediation,
  recommend,
  run,
  generateFallbackRemediation,
};

export default remediation;

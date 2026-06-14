import type {
  AgentRole,
  ArchitectureReport,
  ConfidenceScore,
  EntityId,
  RiskSeverity,
  TimelineEvent,
  TimelineForensicMetadata,
} from "@/types/index";

type SourceType = "repository-url" | "uploaded-code" | "mock-structure" | "unknown";

export type EscalationIndicator =
  | "contained"
  | "emerging"
  | "escalating"
  | "accelerating"
  | "collapse_imminent";

export type DegradationVector =
  | "architecture_drift"
  | "auth_fragmentation"
  | "validation_fragmentation"
  | "dependency_instability"
  | "service_ownership"
  | "scaling_pressure"
  | "retry_inconsistency"
  | "error_propagation"
  | "observability_collapse"
  | "unknown";

export interface RepositoryFileSnapshot {
  path: string;
  content?: string;
  language?: string;
  sizeBytes?: number;
}

export interface CommitSummary {
  hash?: string;
  timestamp?: string;
  title: string;
  summary?: string;
  files?: string[];
  author?: string;
  riskSignals?: string[];
}

export interface ForensicEvidenceInput {
  id?: EntityId;
  label: string;
  description?: string;
  source?: string;
  severity?: RiskSeverity;
  confidence?: ConfidenceScore;
  tags?: string[];
  affectedServices?: string[];
  filePaths?: string[];
}

export interface DependencyAnalysisInput {
  dependencies?: string[];
  unstableDependencies?: string[];
  suspiciousDependencies?: string[];
  driftSignals?: string[];
  dependencyConcerns?: string[];
}

export interface ParsedRepositoryIntelligence {
  sourceType?: SourceType;
  repositoryUrl?: string;
  fileCount?: number;
  files?: RepositoryFileSnapshot[];
  sampledPaths?: string[];
  codeExcerpt?: string;
  detectedFrameworks?: string[];
  detectedServices?: string[];
  dependencies?: string[];
  dependencySignals?: string[];
  duplicatedModules?: string[];
  suspiciousPatterns?: string[];
  architectureDrift?: string[];
  securitySignals?: string[];
  scalingSignals?: string[];
  commitSummaries?: CommitSummary[];
  forensicEvidence?: ForensicEvidenceInput[];
  dependencyAnalysis?: DependencyAnalysisInput;
  metadata?: Record<string, unknown>;
}

export interface HistorianInput {
  repository?: ParsedRepositoryIntelligence;
  parsedRepository?: ParsedRepositoryIntelligence;
  repositoryStructure?: ParsedRepositoryIntelligence;
  commitSummaries?: CommitSummary[];
  architectureFindings?: Partial<ArchitectureReport>;
  architectureReport?: Partial<ArchitectureReport>;
  forensicEvidence?: ForensicEvidenceInput[];
  dependencyAnalysis?: DependencyAnalysisInput;
  suspiciousPatterns?: string[];
}

export interface HistorianTimelineMetadata extends TimelineForensicMetadata {
  degradationVector: DegradationVector;
  escalationIndicator: EscalationIndicator;
  certainty: ConfidenceScore;
  signalStrength: number;
  decisionType: string;
}

export interface HistorianTimelineEvent extends TimelineEvent {
  severity: RiskSeverity;
  metadata: HistorianTimelineMetadata;
  escalationIndicator: EscalationIndicator;
}

export interface EscalationPoint {
  id: EntityId;
  timestamp: string;
  title: string;
  severity: RiskSeverity;
  reason: string;
  evidenceIds: EntityId[];
  certainty: ConfidenceScore;
}

export interface DegradationPattern {
  primaryVector: DegradationVector;
  secondaryVectors: DegradationVector[];
  narrative: string;
  architectureDriftPattern: string;
  instabilityEvolution: string;
  riskEscalationReasoning: string;
  degradationConfidence: ConfidenceScore;
  escalationCertainty: ConfidenceScore;
}

export interface TimelineReconstructionResult {
  timeline: HistorianTimelineEvent[];
  collapseSummary: string;
  degradationPattern: DegradationPattern;
  escalationPoints: EscalationPoint[];
  confidence: ConfidenceScore;
  generatedAt: string;
  metadata: {
    usedFallback: boolean;
    sourceType: SourceType;
    evidenceCount: number;
    commitCount: number;
    affectedServices: string[];
    warnings: string[];
  };
}

export interface HistorianOptions {
  allowFallback?: boolean;
  now?: () => string;
}

type HistoricalContext = {
  sourceType: SourceType;
  repositoryUrl?: string;
  files: RepositoryFileSnapshot[];
  sampledPaths: string[];
  codeCorpus: string;
  commits: CommitSummary[];
  services: string[];
  dependencies: string[];
  dependencySignals: string[];
  duplicatedModules: string[];
  suspiciousPatterns: string[];
  architectureDrift: string[];
  securitySignals: string[];
  scalingSignals: string[];
  evidence: NormalizedEvidence[];
  architecture?: Partial<ArchitectureReport>;
  warnings: string[];
};

type NormalizedEvidence = {
  id: EntityId;
  label: string;
  description: string;
  source?: string;
  severity: RiskSeverity;
  confidence: ConfidenceScore;
  tags: string[];
  affectedServices: string[];
  filePaths: string[];
};

type SignalProfile = {
  vector: DegradationVector;
  title: string;
  baseDescription: string;
  severity: RiskSeverity;
  strength: number;
  confidence: ConfidenceScore;
  evidenceIds: EntityId[];
  affectedServices: string[];
  filePaths: string[];
  source?: string;
  tags: string[];
};

const VECTOR_ORDER: DegradationVector[] = [
  "validation_fragmentation",
  "auth_fragmentation",
  "dependency_instability",
  "service_ownership",
  "architecture_drift",
  "retry_inconsistency",
  "scaling_pressure",
  "error_propagation",
  "observability_collapse",
];

const VECTOR_LABELS: Record<DegradationVector, string> = {
  architecture_drift: "Architecture drift accelerated",
  auth_fragmentation: "Authentication duplication introduced",
  validation_fragmentation: "Validation boundaries fragmented",
  dependency_instability: "Dependency instability escalated",
  service_ownership: "Service ownership became unclear",
  scaling_pressure: "Scaling bottlenecks emerged",
  retry_inconsistency: "Retry logic became inconsistent",
  error_propagation: "Error propagation increased",
  observability_collapse: "Observability signal degraded",
  unknown: "Forensic instability reconstructed",
};

const VECTOR_AGENT: Record<DegradationVector, AgentRole> = {
  architecture_drift: "ARCHITECT",
  auth_fragmentation: "SECURITY_INVESTIGATOR",
  validation_fragmentation: "FORENSIC_ANALYST",
  dependency_instability: "FORENSIC_ANALYST",
  service_ownership: "ARCHITECT",
  scaling_pressure: "FAILURE_PREDICTOR",
  retry_inconsistency: "FAILURE_PREDICTOR",
  error_propagation: "TIMELINE_RECONSTRUCTOR",
  observability_collapse: "TIMELINE_RECONSTRUCTOR",
  unknown: "TIMELINE_RECONSTRUCTOR",
};

export async function reconstructTimeline(
  input: HistorianInput | ParsedRepositoryIntelligence = {},
  architecture?: Partial<ArchitectureReport>,
  options: HistorianOptions = {},
): Promise<TimelineReconstructionResult> {
  try {
    const context = normalizeHistoricalContext(input, architecture);

    if (!isValidContext(context)) {
      throw new Error("Invalid or sparse repository intelligence supplied to historian.");
    }

    await asyncBoundary();

    const profiles = buildSignalProfiles(context);
    const timeline = buildCinematicTimeline(context, profiles);
    const escalationPoints = identifyEscalationPoints(timeline);
    const degradationPattern = analyzeDegradationPattern(context, profiles, timeline);
    const confidence = calculateTimelineConfidence(context, timeline, escalationPoints);

    return {
      timeline,
      collapseSummary: buildCollapseSummary(context, degradationPattern, escalationPoints),
      degradationPattern,
      escalationPoints,
      confidence,
      generatedAt: resolveNow(options),
      metadata: {
        usedFallback: false,
        sourceType: context.sourceType,
        evidenceCount: context.evidence.length,
        commitCount: context.commits.length,
        affectedServices: collectAffectedServices(context, timeline),
        warnings: context.warnings,
      },
    };
  } catch (error) {
    if (options.allowFallback === false) {
      throw error;
    }

    return generateFallbackTimeline(
      error instanceof Error ? error.message : "Unknown historian failure.",
      options,
    );
  }
}

export async function buildTimeline(
  input: HistorianInput | ParsedRepositoryIntelligence = {},
  architecture?: Partial<ArchitectureReport>,
  options: HistorianOptions = {},
): Promise<TimelineReconstructionResult> {
  return reconstructTimeline(input, architecture, options);
}

export async function run(
  input: HistorianInput | ParsedRepositoryIntelligence = {},
  architecture?: Partial<ArchitectureReport>,
  options: HistorianOptions = {},
): Promise<TimelineReconstructionResult> {
  return reconstructTimeline(input, architecture, options);
}

function normalizeHistoricalContext(
  input: HistorianInput | ParsedRepositoryIntelligence,
  architecture?: Partial<ArchitectureReport>,
): HistoricalContext {
  const record = isRecord(input) ? input : {};
  const repository =
    readRecord(record, "repository") ??
    readRecord(record, "parsedRepository") ??
    readRecord(record, "repositoryStructure") ??
    record;
  const architectureFromInput =
    readRecord(record, "architectureReport") ??
    readRecord(record, "architectureFindings") ??
    architecture;
  const dependencyAnalysis = readRecord(record, "dependencyAnalysis") ?? {};
  const files = normalizeFiles(readArray(repository, "files"));
  const sampledPaths = uniqueStrings([
    ...readStringArray(repository, "sampledPaths"),
    ...files.map((file) => file.path),
  ]);
  const codeCorpus = [
    readString(repository, "codeExcerpt"),
    files.map((file) => `${file.path}\n${file.content ?? ""}`).join("\n"),
    sampledPaths.join("\n"),
  ]
    .join("\n")
    .toLowerCase()
    .slice(0, 120_000);
  const dependencySignals = uniqueStrings([
    ...readStringArray(repository, "dependencySignals"),
    ...readStringArray(dependencyAnalysis, "driftSignals"),
    ...readStringArray(dependencyAnalysis, "dependencyConcerns"),
  ]);
  const dependencies = uniqueStrings([
    ...readStringArray(repository, "dependencies"),
    ...readStringArray(dependencyAnalysis, "dependencies"),
    ...readStringArray(dependencyAnalysis, "unstableDependencies"),
    ...readStringArray(dependencyAnalysis, "suspiciousDependencies"),
    ...(architectureFromInput ? readStringArray(architectureFromInput, "dependencies") : []),
  ]);
  const suspiciousPatterns = uniqueStrings([
    ...readStringArray(repository, "suspiciousPatterns"),
    ...readStringArray(record, "suspiciousPatterns"),
    ...(architectureFromInput
      ? [
          ...readStringArray(architectureFromInput, "suspiciousPatterns"),
          ...readStringArray(architectureFromInput, "architectureDrift"),
          ...readStringArray(architectureFromInput, "duplicatedModules"),
        ]
      : []),
  ]);
  const commits = normalizeCommits([
    ...readArray(repository, "commitSummaries"),
    ...readArray(record, "commitSummaries"),
  ]);
  const evidence = normalizeEvidence([
    ...readArray(repository, "forensicEvidence"),
    ...readArray(record, "forensicEvidence"),
  ]);
  const services = uniqueStrings([
    ...readStringArray(repository, "detectedServices"),
    ...(architectureFromInput ? readStringArray(architectureFromInput, "detectedServices") : []),
    ...inferServicesFromPaths(sampledPaths),
  ]);
  const architectureDrift = uniqueStrings([
    ...readStringArray(repository, "architectureDrift"),
    ...(architectureFromInput ? readStringArray(architectureFromInput, "architectureDrift") : []),
    ...filterSignals(suspiciousPatterns, ["architecture", "ownership", "boundary", "drift"]),
  ]);
  const securitySignals = uniqueStrings([
    ...readStringArray(repository, "securitySignals"),
    ...filterSignals(suspiciousPatterns, ["auth", "token", "session", "jwt", "permission"]),
    ...filterSignals(evidence.map((item) => `${item.label} ${item.description}`), [
      "auth",
      "token",
      "session",
      "security",
    ]),
  ]);
  const scalingSignals = uniqueStrings([
    ...readStringArray(repository, "scalingSignals"),
    ...filterSignals(suspiciousPatterns, ["queue", "retry", "timeout", "scale", "latency"]),
    ...filterSignals(evidence.map((item) => `${item.label} ${item.description}`), [
      "queue",
      "retry",
      "scaling",
      "latency",
    ]),
  ]);
  const duplicatedModules = uniqueStrings([
    ...readStringArray(repository, "duplicatedModules"),
    ...(architectureFromInput ? readStringArray(architectureFromInput, "duplicatedModules") : []),
    ...filterSignals(sampledPaths, ["duplicate", "fallback", "legacy", "copy"]),
  ]);
  const warnings: string[] = [];

  if (commits.length === 0) {
    warnings.push("Commit history unavailable; historian inferred chronology from code and architecture signals.");
  }

  if (files.length === 0 && sampledPaths.length === 0 && suspiciousPatterns.length === 0) {
    warnings.push("Repository structure is sparse; fallback-grade inference may be required.");
  }

  return {
    sourceType: normalizeSourceType(readString(repository, "sourceType")),
    repositoryUrl: readString(repository, "repositoryUrl"),
    files,
    sampledPaths,
    codeCorpus,
    commits,
    services,
    dependencies,
    dependencySignals,
    duplicatedModules,
    suspiciousPatterns,
    architectureDrift,
    securitySignals,
    scalingSignals,
    evidence,
    architecture: architectureFromInput,
    warnings,
  };
}

function buildSignalProfiles(context: HistoricalContext): SignalProfile[] {
  const profiles: SignalProfile[] = [
    profileFromSignals(
      "validation_fragmentation",
      [
        ...filterSignals(context.suspiciousPatterns, ["validation", "schema", "zod", "payload"]),
        ...filterSignals(context.sampledPaths, ["validator", "schema", "dto"]),
      ],
      context,
      "Validation boundaries began interpreting the same business event through competing schemas, creating the first fracture in the evidence chain.",
    ),
    profileFromSignals(
      "auth_fragmentation",
      [
        ...context.securitySignals,
        ...filterSignals(context.duplicatedModules, ["auth", "session", "token", "jwt"]),
        ...filterCorpus(context.codeCorpus, ["auth", "session", "token", "jwt"], "Authentication authority appears in multiple execution paths."),
      ],
      context,
      "Authentication authority split across runtime surfaces, making authorization verdicts dependent on the path an event took through the system.",
    ),
    profileFromSignals(
      "dependency_instability",
      [
        ...context.dependencySignals,
        ...filterSignals(context.dependencies, ["legacy", "unstable", "floating", "worker-only"]),
        ...filterCorpus(context.codeCorpus, ["package-lock", "peer", "version", "dependency"], "Dependency behavior diverged between runtime zones."),
      ],
      context,
      "Dependency resolution drifted between services, turning deployment into a behavioral change event rather than a controlled release.",
    ),
    profileFromSignals(
      "service_ownership",
      [
        ...filterSignals(context.architectureDrift, ["ownership", "boundary", "domain", "control"]),
        ...filterSignals(context.suspiciousPatterns, ["ownership", "shared", "cross-domain"]),
      ],
      context,
      "Service ownership became ambiguous as recovery decisions moved away from the domains that understood the original invariants.",
    ),
    profileFromSignals(
      "architecture_drift",
      context.architectureDrift,
      context,
      "Architecture drift accelerated when runtime calls stopped matching the intended topology and hidden coupling became operational policy.",
    ),
    profileFromSignals(
      "retry_inconsistency",
      [
        ...filterSignals(context.scalingSignals, ["retry", "replay", "dead-letter", "backoff"]),
        ...filterSignals(context.sampledPaths, ["retry", "queue", "worker", "replay"]),
        ...filterCorpus(context.codeCorpus, ["retry", "backoff", "deadletter", "dead-letter"], "Retry behavior is present in multiple recovery paths."),
      ],
      context,
      "Retry behavior became inconsistent, allowing recovery logic to amplify faults instead of containing them.",
    ),
    profileFromSignals(
      "scaling_pressure",
      [
        ...context.scalingSignals,
        ...filterCorpus(context.codeCorpus, ["queue", "worker", "timeout", "rate limit", "concurrency"], "Scaling pressure emerged around queues, workers, or timeout-sensitive paths."),
      ],
      context,
      "Scaling bottlenecks emerged as replay, queue pressure, and worker concurrency began competing with live traffic.",
    ),
    profileFromSignals(
      "error_propagation",
      [
        ...filterSignals(context.suspiciousPatterns, ["error", "exception", "failure", "cascade"]),
        ...filterCorpus(context.codeCorpus, ["throw", "catch", "error", "exception"], "Error handling spans enough surfaces to support propagation analysis."),
      ],
      context,
      "Errors propagated as repeated downstream symptoms, making the original engineering decision harder to isolate.",
    ),
    profileFromSignals(
      "observability_collapse",
      [
        ...filterSignals(context.suspiciousPatterns, ["logging", "observability", "trace", "metric"]),
        ...filterSignals(context.sampledPaths, ["logger", "telemetry", "observability", "metrics"]),
      ],
      context,
      "Observability began recording the collapse as noise instead of preserving first-failure causality.",
    ),
  ];

  const commitProfiles = profiles.map((profile) =>
    enrichProfileFromCommits(profile, context.commits),
  );

  return commitProfiles
    .filter((profile) => profile.strength > 0 || profile.vector === "architecture_drift")
    .sort(
      (left, right) =>
        VECTOR_ORDER.indexOf(left.vector) - VECTOR_ORDER.indexOf(right.vector) ||
        right.strength - left.strength,
    )
    .slice(0, 8);
}

function buildCinematicTimeline(
  context: HistoricalContext,
  profiles: SignalProfile[],
): HistorianTimelineEvent[] {
  const effectiveProfiles =
    profiles.length > 0
      ? profiles
      : [
          profileFromSignals(
            "unknown",
            ["Sparse repository evidence required conservative historical reconstruction."],
            context,
            "The historian found sparse evidence but still reconstructed a conservative degradation corridor.",
          ),
        ];

  return effectiveProfiles.map((profile, index) => {
    const escalationIndicator = escalationFor(index, effectiveProfiles.length, profile.severity);
    const timestamp = timestampFor(index, context.commits[index]?.timestamp);
    const commit = context.commits[index];
    const description = narrateEvent(profile, escalationIndicator, commit, index);

    return {
      id: createId("timeline", `${profile.vector}-${index}`),
      timestamp,
      title: profile.title,
      severity: escalateSeverity(profile.severity, index, effectiveProfiles.length),
      description,
      escalationIndicator,
      metadata: {
        agentRole: VECTOR_AGENT[profile.vector],
        source: profile.source ?? commit?.hash ?? context.repositoryUrl ?? context.sourceType,
        confidence: profile.confidence,
        evidenceIds: profile.evidenceIds,
        affectedServices: profile.affectedServices,
        commitSha: commit?.hash,
        filePaths: uniqueStrings([
          ...profile.filePaths,
          ...(commit?.files ?? []),
        ]).slice(0, 8),
        tags: uniqueStrings([profile.vector, ...profile.tags, escalationIndicator]),
        degradationVector: profile.vector,
        escalationIndicator,
        certainty: profile.confidence,
        signalStrength: profile.strength,
        decisionType: decisionTypeFor(profile.vector),
      },
    };
  });
}

function identifyEscalationPoints(timeline: HistorianTimelineEvent[]): EscalationPoint[] {
  return timeline
    .filter(
      (event) =>
        event.severity === "critical" ||
        event.escalationIndicator === "accelerating" ||
        event.escalationIndicator === "collapse_imminent",
    )
    .map((event) => ({
      id: createId("escalation", event.id),
      timestamp: String(event.timestamp),
      title: event.title,
      severity: event.severity,
      reason: `Escalation marker ${event.escalationIndicator.replace("_", " ")}: ${event.description}`,
      evidenceIds: event.metadata.evidenceIds ?? [],
      certainty: event.metadata.certainty,
    }));
}

function analyzeDegradationPattern(
  context: HistoricalContext,
  profiles: SignalProfile[],
  timeline: HistorianTimelineEvent[],
): DegradationPattern {
  const sorted = [...profiles].sort((left, right) => right.strength - left.strength);
  const primaryVector = sorted[0]?.vector ?? "unknown";
  const secondaryVectors = sorted
    .slice(1)
    .map((profile) => profile.vector)
    .filter((vector): vector is DegradationVector => vector !== primaryVector)
    .slice(0, 4);
  const affectedServices = collectAffectedServices(context, timeline).slice(0, 5);
  const opening =
    primaryVector === "unknown"
      ? "Sparse evidence forced the historian into conservative reconstruction."
      : `${VECTOR_LABELS[primaryVector]} became the dominant degradation vector.`;

  return {
    primaryVector,
    secondaryVectors,
    narrative: `${opening} The reconstructed story links ${humanList(
      affectedServices.length > 0 ? affectedServices : ["core runtime", "API boundary"],
    )} through a sequence of engineering decisions that slowly converted maintainable complexity into operational pressure.`,
    architectureDriftPattern:
      context.architectureDrift[0] ??
      "Architecture drift appears as hidden coupling between service ownership, validation policy, and recovery behavior.",
    instabilityEvolution:
      timeline.length > 1
        ? `Instability evolved from ${timeline[0].title.toLowerCase()} into ${
            timeline[timeline.length - 1].title.toLowerCase()
          }, with each event increasing blast radius and reducing causal clarity.`
        : "Instability could not be sequenced with high precision, but available signals indicate gradual degradation rather than a single isolated fault.",
    riskEscalationReasoning:
      "Risk escalated because each layer delegated responsibility to the next: validators trusted adapters, adapters trusted replay, replay trusted queues, and queues converted unresolved defects into repeated production pressure.",
    degradationConfidence: calculatePatternConfidence(context, profiles),
    escalationCertainty: calculateEscalationCertainty(timeline),
  };
}

function buildCollapseSummary(
  context: HistoricalContext,
  pattern: DegradationPattern,
  escalationPoints: EscalationPoint[],
) {
  const serviceClause = humanList(
    collectAffectedServices(context, []).slice(0, 5),
    "core services",
  );
  const escalationClause =
    escalationPoints.length > 0
      ? `${escalationPoints.length} escalation point${escalationPoints.length === 1 ? "" : "s"}`
      : "no confirmed escalation point";

  return `The historian reconstructed a digital crime scene across ${serviceClause}. ${VECTOR_LABELS[
    pattern.primaryVector
  ]} appears to be the first dominant fracture, followed by ${humanList(
    pattern.secondaryVectors.map((vector) => VECTOR_LABELS[vector].toLowerCase()),
    "supporting degradation signals",
  )}. The collapse was progressive: engineering decisions accumulated quietly until ${escalationClause} revealed that the system was no longer degrading locally, but narrating failure across architecture, runtime, and operations.`;
}

function calculateTimelineConfidence(
  context: HistoricalContext,
  timeline: HistorianTimelineEvent[],
  escalationPoints: EscalationPoint[],
) {
  const evidenceBonus = Math.min(context.evidence.length * 4, 16);
  const commitBonus = Math.min(context.commits.length * 3, 12);
  const architectureBonus = Math.min(context.architectureDrift.length * 3, 12);
  const timelineBonus = Math.min(timeline.length * 4, 20);
  const escalationBonus = Math.min(escalationPoints.length * 3, 9);
  const sparsePenalty = context.warnings.length * 6;

  return clampScore(
    52 + evidenceBonus + commitBonus + architectureBonus + timelineBonus + escalationBonus - sparsePenalty,
  );
}

function calculatePatternConfidence(context: HistoricalContext, profiles: SignalProfile[]) {
  const signalStrength = profiles.reduce((sum, profile) => sum + profile.strength, 0);
  return clampScore(58 + Math.min(signalStrength * 2, 28) + Math.min(context.services.length * 2, 10));
}

function calculateEscalationCertainty(timeline: HistorianTimelineEvent[]) {
  const severeEvents = timeline.filter(
    (event) => event.severity === "high" || event.severity === "critical",
  ).length;
  const accelerationEvents = timeline.filter(
    (event) =>
      event.escalationIndicator === "accelerating" ||
      event.escalationIndicator === "collapse_imminent",
  ).length;

  return clampScore(60 + severeEvents * 5 + accelerationEvents * 8);
}

function profileFromSignals(
  vector: DegradationVector,
  signals: string[],
  context: HistoricalContext,
  fallbackDescription: string,
): SignalProfile {
  const normalizedSignals = uniqueStrings(signals.filter(Boolean));
  const matchingEvidence = context.evidence.filter((item) =>
    evidenceMatchesVector(item, vector),
  );
  const strength = normalizedSignals.length + matchingEvidence.length * 2;
  const evidenceIds = matchingEvidence.map((item) => item.id).slice(0, 5);
  const affectedServices = uniqueStrings([
    ...matchingEvidence.flatMap((item) => item.affectedServices),
    ...inferAffectedServices(vector, context),
  ]).slice(0, 6);
  const filePaths = uniqueStrings([
    ...matchingEvidence.flatMap((item) => item.filePaths),
    ...pathsForVector(vector, context.sampledPaths),
  ]).slice(0, 8);
  const strongestSignal = normalizedSignals[0] ?? matchingEvidence[0]?.description;

  return {
    vector,
    title: VECTOR_LABELS[vector],
    baseDescription: strongestSignal
      ? `${fallbackDescription} Evidence signal: ${strongestSignal}`
      : fallbackDescription,
    severity: severityFromStrength(strength, vector),
    strength,
    confidence: clampScore(64 + strength * 5 + matchingEvidence.length * 3),
    evidenceIds,
    affectedServices,
    filePaths,
    source: matchingEvidence[0]?.source,
    tags: uniqueStrings([
      vector,
      ...matchingEvidence.flatMap((item) => item.tags),
      ...normalizedSignals.slice(0, 3).map(slugify),
    ]).slice(0, 8),
  };
}

function enrichProfileFromCommits(profile: SignalProfile, commits: CommitSummary[]): SignalProfile {
  const matchingCommit = commits.find((commit) => {
    const corpus = `${commit.title} ${commit.summary ?? ""} ${(commit.files ?? []).join(" ")} ${(
      commit.riskSignals ?? []
    ).join(" ")}`.toLowerCase();
    return vectorKeywords(profile.vector).some((keyword) => corpus.includes(keyword));
  });

  if (!matchingCommit) {
    return profile;
  }

  return {
    ...profile,
    strength: profile.strength + 2,
    confidence: clampScore(profile.confidence + 6),
    source: matchingCommit.hash ?? profile.source,
    filePaths: uniqueStrings([...profile.filePaths, ...(matchingCommit.files ?? [])]).slice(0, 8),
    baseDescription: `${profile.baseDescription} Commit trace "${matchingCommit.title}" anchors the moment in the engineering record.`,
  };
}

function narrateEvent(
  profile: SignalProfile,
  escalation: EscalationIndicator,
  commit: CommitSummary | undefined,
  index: number,
) {
  const escalationText: Record<EscalationIndicator, string> = {
    contained:
      "At this stage the failure remained local, visible only as a weak distortion in the system's design intent.",
    emerging:
      "The instability began to leave forensic residue across adjacent services.",
    escalating:
      "The decision stopped being isolated and started shaping runtime behavior.",
    accelerating:
      "The blast radius widened as the system converted ambiguity into production pressure.",
    collapse_imminent:
      "By this point the system was no longer merely unstable; it was preparing to repeat the failure under load.",
  };
  const commitText = commit
    ? ` Commit evidence "${commit.title}"${commit.hash ? ` (${commit.hash})` : ""} strengthens the chronology.`
    : "";
  const sequenceText =
    index === 0
      ? "The first visible fracture appears here."
      : "The previous fracture did not resolve; it became the foundation for the next one.";

  return `${sequenceText} ${profile.baseDescription} ${escalationText[escalation]}${commitText}`;
}

function generateFallbackTimeline(
  reason: string,
  options: HistorianOptions,
): TimelineReconstructionResult {
  const fallbackContext: HistoricalContext = {
    sourceType: "mock-structure",
    files: [],
    sampledPaths: [],
    codeCorpus: "",
    commits: [],
    services: ["auth-service", "api-gateway", "billing-worker", "event-bus"],
    dependencies: ["jose", "jsonwebtoken", "bullmq", "stripe", "postgres"],
    dependencySignals: ["Worker dependency behavior diverged from API runtime during replay."],
    duplicatedModules: ["auth/sessionValidator.ts", "workers/replay/authFallback.ts"],
    suspiciousPatterns: [
      "Validation boundary fragmented after payment integration.",
      "Retry logic became inconsistent between live handlers and replay workers.",
    ],
    architectureDrift: [
      "Service ownership became unclear after recovery logic moved into event consumers.",
    ],
    securitySignals: ["Authentication duplication introduced inconsistent session verdicts."],
    scalingSignals: ["Queue replay projected to saturate billing workers under peak traffic."],
    evidence: [
      {
        id: "fallback-auth-drift",
        label: "Fallback auth drift",
        description: "Authentication duplication inferred from mock forensic baseline.",
        severity: "critical",
        confidence: 89,
        tags: ["auth", "fallback"],
        affectedServices: ["auth-service", "billing-worker"],
        filePaths: ["middleware.ts", "workers/replay/authFallback.ts"],
      },
    ],
    warnings: [`Fallback timeline activated: ${reason}`],
  };
  const profiles = buildSignalProfiles(fallbackContext);
  const timeline = buildCinematicTimeline(fallbackContext, profiles);
  const escalationPoints = identifyEscalationPoints(timeline);
  const degradationPattern = analyzeDegradationPattern(fallbackContext, profiles, timeline);

  return {
    timeline,
    collapseSummary: buildCollapseSummary(fallbackContext, degradationPattern, escalationPoints),
    degradationPattern,
    escalationPoints,
    confidence: 86,
    generatedAt: resolveNow(options),
    metadata: {
      usedFallback: true,
      sourceType: "mock-structure",
      evidenceCount: fallbackContext.evidence.length,
      commitCount: 0,
      affectedServices: collectAffectedServices(fallbackContext, timeline),
      warnings: fallbackContext.warnings,
    },
  };
}

function isValidContext(context: HistoricalContext) {
  return (
    context.files.length > 0 ||
    context.sampledPaths.length > 0 ||
    context.commits.length > 0 ||
    context.evidence.length > 0 ||
    context.suspiciousPatterns.length > 0 ||
    context.architectureDrift.length > 0 ||
    context.securitySignals.length > 0 ||
    context.scalingSignals.length > 0 ||
    context.dependencies.length > 0
  );
}

function normalizeFiles(value: unknown[]) {
  return value
    .map((item, index): RepositoryFileSnapshot => {
      const record = isRecord(item) ? item : {};
      return {
        path: readString(record, "path") ?? readString(record, "name") ?? `file-${index + 1}.txt`,
        content: readString(record, "content"),
        language: readString(record, "language"),
        sizeBytes: readNumber(record, "sizeBytes"),
      };
    })
    .filter((file) => file.path.trim().length > 0);
}

function normalizeCommits(value: unknown[]) {
  return value
    .map((item): CommitSummary | undefined => {
      const record = isRecord(item) ? item : undefined;

      if (!record) {
        return undefined;
      }

      const title = readString(record, "title") ?? readString(record, "message");

      if (!title) {
        return undefined;
      }

      return {
        hash: readString(record, "hash") ?? readString(record, "sha") ?? readString(record, "commitSha"),
        timestamp: readString(record, "timestamp") ?? readString(record, "date"),
        title,
        summary: readString(record, "summary") ?? readString(record, "description"),
        files: readStringArray(record, "files"),
        author: readString(record, "author"),
        riskSignals: readStringArray(record, "riskSignals"),
      };
    })
    .filter((commit): commit is CommitSummary => Boolean(commit));
}

function normalizeEvidence(value: unknown[]) {
  return value
    .map((item, index): NormalizedEvidence | undefined => {
      const record = isRecord(item) ? item : undefined;

      if (!record) {
        return undefined;
      }

      const label = readString(record, "label") ?? readString(record, "title");

      if (!label) {
        return undefined;
      }

      return {
        id: readString(record, "id") ?? createId("evidence", `${label}-${index}`),
        label,
        description:
          readString(record, "description") ??
          "Forensic evidence supplied without detailed description.",
        source: readString(record, "source"),
        severity: normalizeSeverity(readString(record, "severity")) ?? "medium",
        confidence: clampScore(readNumber(record, "confidence") ?? 76),
        tags: readStringArray(record, "tags"),
        affectedServices: readStringArray(record, "affectedServices"),
        filePaths: readStringArray(record, "filePaths"),
      };
    })
    .filter((item): item is NormalizedEvidence => Boolean(item));
}

function evidenceMatchesVector(evidence: NormalizedEvidence, vector: DegradationVector) {
  const corpus = `${evidence.label} ${evidence.description} ${evidence.tags.join(" ")} ${evidence.source ?? ""}`.toLowerCase();
  return vectorKeywords(vector).some((keyword) => corpus.includes(keyword));
}

function inferAffectedServices(vector: DegradationVector, context: HistoricalContext) {
  const keywords = vectorKeywords(vector);
  const services = context.services.filter((service) =>
    keywords.some((keyword) => service.toLowerCase().includes(keyword)),
  );

  if (services.length > 0) {
    return services;
  }

  const fallback: Partial<Record<DegradationVector, string[]>> = {
    auth_fragmentation: ["auth-service", "api-gateway"],
    validation_fragmentation: ["api-gateway", "webhook-adapter"],
    dependency_instability: ["api-gateway", "worker-runtime"],
    scaling_pressure: ["queue", "worker-runtime"],
    retry_inconsistency: ["event-bus", "worker-runtime"],
    service_ownership: ["api-gateway", "domain-services"],
    architecture_drift: context.services.slice(0, 4),
    error_propagation: ["observability", "api-gateway"],
    observability_collapse: ["observability"],
  };

  return fallback[vector] ?? context.services.slice(0, 3);
}

function pathsForVector(vector: DegradationVector, paths: string[]) {
  const keywords = vectorKeywords(vector);
  return paths.filter((path) => keywords.some((keyword) => path.toLowerCase().includes(keyword)));
}

function vectorKeywords(vector: DegradationVector) {
  const keywords: Record<DegradationVector, string[]> = {
    architecture_drift: ["architecture", "topology", "boundary", "drift", "service"],
    auth_fragmentation: ["auth", "session", "token", "jwt", "permission"],
    validation_fragmentation: ["validation", "validator", "schema", "payload", "zod"],
    dependency_instability: ["dependency", "package", "lock", "version", "peer"],
    service_ownership: ["ownership", "domain", "shared", "adapter", "boundary"],
    scaling_pressure: ["scale", "queue", "worker", "timeout", "latency", "concurrency"],
    retry_inconsistency: ["retry", "replay", "backoff", "dead-letter", "deadletter"],
    error_propagation: ["error", "exception", "failure", "cascade", "propagation"],
    observability_collapse: ["observability", "telemetry", "trace", "metric", "logging"],
    unknown: ["risk", "instability", "failure"],
  };

  return keywords[vector];
}

function decisionTypeFor(vector: DegradationVector) {
  const decisionTypes: Record<DegradationVector, string> = {
    architecture_drift: "topology decision drift",
    auth_fragmentation: "identity authority split",
    validation_fragmentation: "contract boundary divergence",
    dependency_instability: "runtime parity erosion",
    service_ownership: "domain ownership ambiguity",
    scaling_pressure: "capacity model pressure",
    retry_inconsistency: "recovery policy divergence",
    error_propagation: "failure containment breakdown",
    observability_collapse: "causality signal loss",
    unknown: "forensic inference",
  };

  return decisionTypes[vector];
}

function severityFromStrength(strength: number, vector: DegradationVector): RiskSeverity {
  const criticalVectors: DegradationVector[] = [
    "auth_fragmentation",
    "scaling_pressure",
    "error_propagation",
  ];

  if (strength >= 7 || (strength >= 4 && criticalVectors.includes(vector))) {
    return "critical";
  }

  if (strength >= 4) {
    return "high";
  }

  if (strength >= 2) {
    return "medium";
  }

  return "low";
}

function escalateSeverity(
  severity: RiskSeverity,
  index: number,
  total: number,
): RiskSeverity {
  if (total <= 2 || index < Math.floor(total * 0.55)) {
    return severity;
  }

  if (severity === "low") {
    return "medium";
  }

  if (severity === "medium") {
    return "high";
  }

  if (index >= total - 1 && severity === "high") {
    return "critical";
  }

  return severity;
}

function escalationFor(
  index: number,
  total: number,
  severity: RiskSeverity,
): EscalationIndicator {
  const position = total <= 1 ? 1 : index / (total - 1);

  if (severity === "critical" && position > 0.75) {
    return "collapse_imminent";
  }

  if (position > 0.72) {
    return "accelerating";
  }

  if (position > 0.42 || severity === "high" || severity === "critical") {
    return "escalating";
  }

  if (position > 0.16 || severity === "medium") {
    return "emerging";
  }

  return "contained";
}

function timestampFor(index: number, commitTimestamp?: string) {
  if (commitTimestamp) {
    return commitTimestamp;
  }

  const minute = 3 + index * 5;
  const second = (12 + index * 17) % 60;

  return `T+00:${String(minute).padStart(2, "0")}:${String(second).padStart(2, "0")}`;
}

function collectAffectedServices(
  context: HistoricalContext,
  timeline: HistorianTimelineEvent[],
) {
  return uniqueStrings([
    ...context.services,
    ...timeline.flatMap((event) => event.metadata.affectedServices ?? []),
    ...context.evidence.flatMap((item) => item.affectedServices),
  ]).slice(0, 12);
}

function filterSignals(values: string[], keywords: string[]) {
  return values.filter((value) => {
    const normalized = value.toLowerCase();
    return keywords.some((keyword) => normalized.includes(keyword));
  });
}

function filterCorpus(corpus: string, keywords: string[], message: string) {
  return keywords.some((keyword) => corpus.includes(keyword)) ? [message] : [];
}

function inferServicesFromPaths(paths: string[]) {
  const serviceHints = new Set<string>();

  for (const path of paths) {
    const normalized = path.toLowerCase();

    if (normalized.includes("auth")) {
      serviceHints.add("auth-service");
    }

    if (normalized.includes("api") || normalized.includes("route")) {
      serviceHints.add("api-gateway");
    }

    if (normalized.includes("worker") || normalized.includes("queue")) {
      serviceHints.add("worker-runtime");
    }

    if (normalized.includes("billing") || normalized.includes("payment")) {
      serviceHints.add("billing-service");
    }

    if (normalized.includes("db") || normalized.includes("database") || normalized.includes("prisma")) {
      serviceHints.add("data-layer");
    }

    if (normalized.includes("web") || normalized.includes("components")) {
      serviceHints.add("web-console");
    }
  }

  return [...serviceHints];
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

function normalizeSeverity(value?: string): RiskSeverity | undefined {
  const normalized = value?.toLowerCase();

  if (
    normalized === "low" ||
    normalized === "medium" ||
    normalized === "high" ||
    normalized === "critical"
  ) {
    return normalized;
  }

  if (normalized === "moderate") {
    return "medium";
  }

  return undefined;
}

function readRecord(value: Record<string, unknown>, key: string) {
  const candidate = value[key];
  return isRecord(candidate) ? candidate : undefined;
}

function readArray(value: Record<string, unknown>, key: string) {
  const candidate = value[key];
  return Array.isArray(candidate) ? candidate : [];
}

function readString(value: Record<string, unknown>, key: string) {
  const candidate = value[key];
  return typeof candidate === "string" && candidate.trim().length > 0
    ? candidate
    : undefined;
}

function readNumber(value: Record<string, unknown>, key: string) {
  const candidate = value[key];
  return typeof candidate === "number" && Number.isFinite(candidate)
    ? candidate
    : undefined;
}

function readStringArray(value: Record<string, unknown> | undefined, key: string) {
  if (!value) {
    return [];
  }

  const candidate = value[key];

  if (!Array.isArray(candidate)) {
    return [];
  }

  return candidate.filter((item): item is string => typeof item === "string");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function uniqueStrings(values: Array<string | undefined>) {
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

function humanList(values: string[], fallback = "available evidence") {
  const list = values.filter(Boolean);

  if (list.length === 0) {
    return fallback;
  }

  if (list.length === 1) {
    return list[0];
  }

  if (list.length === 2) {
    return `${list[0]} and ${list[1]}`;
  }

  return `${list.slice(0, -1).join(", ")}, and ${list[list.length - 1]}`;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 48);
}

function createId(prefix: string, value: unknown) {
  return `${prefix}-${slugify(String(value)) || "unknown"}`;
}

function clampScore(value: number): ConfidenceScore {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function resolveNow(options: HistorianOptions) {
  return options.now?.() ?? new Date().toISOString();
}

async function asyncBoundary() {
  await Promise.resolve();
}

export const historian = {
  reconstructTimeline,
  buildTimeline,
  run,
};

export default historian;

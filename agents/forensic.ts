export type ForensicSeverity = "low" | "medium" | "high" | "critical";

export type ForensicArea =
  | "authentication"
  | "dependencies"
  | "architecture"
  | "validation"
  | "coupling"
  | "scaling"
  | "errors"
  | "dead-code"
  | "services"
  | "api";

export type RepositoryFileSignal = {
  path?: string;
  name?: string;
  content?: string;
  language?: string;
  sizeBytes?: number;
  imports?: string[];
  exports?: string[];
};

export type RepositoryDependencySignal = {
  name: string;
  version?: string;
  scope?: "production" | "development" | "peer" | "optional" | "unknown";
  source?: string;
};

export type RepositoryServiceSignal = {
  name: string;
  type?: "frontend" | "api" | "service" | "database" | "queue" | "worker" | "auth" | "external" | "unknown";
  path?: string;
  dependencies?: string[];
  communicatesWith?: string[];
};

export type RepositoryCommitSignal = {
  hash?: string;
  message: string;
  author?: string;
  date?: string;
  filesChanged?: string[];
};

export type RepositoryIntelligence = {
  repositoryName?: string;
  repositoryUrl?: string;
  fileStructure?: unknown;
  files?: RepositoryFileSignal[];
  dependencyMap?: unknown;
  dependencies?: Array<RepositoryDependencySignal | string>;
  duplicatedModules?: string[];
  frameworkUsage?: string[];
  frameworks?: string[];
  serviceArchitecture?: unknown;
  services?: RepositoryServiceSignal[];
  commitSummaries?: Array<RepositoryCommitSignal | string>;
  suspiciousPatterns?: string[];
  apiSurface?: unknown;
  metadata?: Record<string, unknown>;
};

export type ForensicEvidence = {
  id: string;
  area: ForensicArea;
  title: string;
  description: string;
  severity: ForensicSeverity;
  confidence: number;
  indicators: string[];
  locations: string[];
  forensicMarker: string;
};

export type ArchitectureFinding = {
  id: string;
  area: ForensicArea;
  title: string;
  narrative: string;
  severity: ForensicSeverity;
  confidence: number;
  affectedZones: string[];
  evidenceIds: string[];
  recommendation: string;
};

export type SuspiciousPatternFinding = {
  id: string;
  pattern: string;
  area: ForensicArea;
  severity: ForensicSeverity;
  confidence: number;
  explanation: string;
  evidenceIds: string[];
};

export type InstabilitySignal = {
  id: string;
  signal: string;
  area: ForensicArea;
  severity: ForensicSeverity;
  confidence: number;
  blastRadius: string;
  trigger: string;
  evidenceIds: string[];
};

export type ForensicConfidence = {
  investigationConfidence: number;
  riskConfidence: number;
  architecturalIntegrityEstimate: number;
  dataCompleteness: number;
  method: "heuristic" | "ai-assisted" | "cinematic-fallback";
};

export type EngineeringAssessment = {
  riskLevel: ForensicSeverity;
  degradationStage: string;
  rootCause: string;
  collapseNarrative: string;
  blastRadius: string;
  nextFailureMode: string;
  architecturalIntegrity: string;
  strategicRecommendation: string;
};

export type ForensicIntelligence = {
  summary: string;
  architectureFindings: ArchitectureFinding[];
  suspiciousPatterns: SuspiciousPatternFinding[];
  instabilitySignals: InstabilitySignal[];
  evidence: ForensicEvidence[];
  confidence: ForensicConfidence;
  engineeringAssessment: EngineeringAssessment;
};

export type ForensicAiProvider = {
  generateForensicReport: (
    intelligence: RepositoryIntelligence,
    context: ForensicInvestigationContext,
  ) => Promise<Partial<ForensicIntelligence> | string | null>;
};

export type ForensicInvestigationOptions = {
  aiProvider?: ForensicAiProvider;
  preferAi?: boolean;
  maxEvidenceEntries?: number;
};

export type ForensicInvestigationContext = {
  repositoryName: string;
  filePaths: string[];
  dependencyNames: string[];
  frameworks: string[];
  services: string[];
  duplicateHints: string[];
  suspiciousHints: string[];
  commitMessages: string[];
  dataCompleteness: number;
};

type NormalizedRepositoryIntelligence = {
  repositoryName: string;
  filePaths: string[];
  fileContents: Array<{ path: string; content: string }>;
  dependencies: RepositoryDependencySignal[];
  frameworks: string[];
  services: RepositoryServiceSignal[];
  duplicatedModules: string[];
  suspiciousPatterns: string[];
  commitSummaries: RepositoryCommitSignal[];
  apiSurface: string[];
  dataCompleteness: number;
};

type Indicator = {
  area: ForensicArea;
  title: string;
  description: string;
  severity: ForensicSeverity;
  confidence: number;
  indicators: string[];
  locations: string[];
  marker: string;
};

const FORENSIC_AREAS: ForensicArea[] = [
  "authentication",
  "dependencies",
  "architecture",
  "validation",
  "coupling",
  "scaling",
  "errors",
  "dead-code",
  "services",
  "api",
];

export async function investigateRepositoryForensics(
  intelligence: RepositoryIntelligence,
  options: ForensicInvestigationOptions = {},
): Promise<ForensicIntelligence> {
  try {
    const normalized = normalizeRepositoryIntelligence(intelligence);
    const context = buildInvestigationContext(normalized);
    const heuristicReport = synthesizeForensicIntelligence(
      normalized,
      options.maxEvidenceEntries,
    );

    if (options.preferAi && options.aiProvider) {
      const aiReport = await tryGenerateAiForensics(
        intelligence,
        context,
        options.aiProvider,
      );

      if (aiReport) {
        return mergeForensicReports(heuristicReport, aiReport);
      }
    }

    return heuristicReport;
  } catch (error) {
    return generateCinematicFallbackIntelligence(error);
  }
}

export async function analyzeForensicIntelligence(
  intelligence: RepositoryIntelligence,
  options?: ForensicInvestigationOptions,
): Promise<ForensicIntelligence> {
  return investigateRepositoryForensics(intelligence, options);
}

export const forensic = {
  analyze: investigateRepositoryForensics,
  investigate: investigateRepositoryForensics,
  fallback: generateCinematicFallbackIntelligence,
};

async function tryGenerateAiForensics(
  intelligence: RepositoryIntelligence,
  context: ForensicInvestigationContext,
  aiProvider: ForensicAiProvider,
): Promise<Partial<ForensicIntelligence> | null> {
  try {
    const report = await aiProvider.generateForensicReport(intelligence, context);

    if (!report) {
      return null;
    }

    if (typeof report === "string") {
      return JSON.parse(stripJsonFence(report)) as Partial<ForensicIntelligence>;
    }

    return report;
  } catch {
    return null;
  }
}

function normalizeRepositoryIntelligence(
  intelligence: RepositoryIntelligence,
): NormalizedRepositoryIntelligence {
  const safeInput = isRecord(intelligence) ? intelligence : {};
  const files = normalizeFiles(safeInput.files);
  const structurePaths = extractFilePaths(safeInput.fileStructure);
  const filePaths = uniqueCompact([
    ...files.map((file) => file.path ?? file.name ?? ""),
    ...structurePaths,
  ]);
  const dependencies = normalizeDependencies(
    safeInput.dependencies,
    safeInput.dependencyMap,
  );
  const services = normalizeServices(
    safeInput.services,
    safeInput.serviceArchitecture,
    filePaths,
  );
  const frameworks = uniqueCompact([
    ...normalizeStringArray(safeInput.frameworks),
    ...normalizeStringArray(safeInput.frameworkUsage),
    ...inferFrameworks(filePaths, dependencies, files),
  ]);
  const commitSummaries = normalizeCommits(safeInput.commitSummaries);
  const suspiciousPatterns = uniqueCompact([
    ...normalizeStringArray(safeInput.suspiciousPatterns),
    ...inferSuspiciousPatternHints(filePaths, files, commitSummaries),
  ]);
  const duplicatedModules = uniqueCompact([
    ...normalizeStringArray(safeInput.duplicatedModules),
    ...inferDuplicatedModules(filePaths, files),
  ]);
  const apiSurface = extractApiSurface(safeInput.apiSurface, filePaths);

  return {
    repositoryName:
      stringOrUndefined(safeInput.repositoryName) ??
      inferRepositoryName(safeInput.repositoryUrl) ??
      "unknown-repository",
    filePaths,
    fileContents: files
      .filter((file) => Boolean(file.content))
      .map((file, index) => ({
        path: file.path ?? file.name ?? `memory-file-${index + 1}.txt`,
        content: file.content ?? "",
      })),
    dependencies,
    frameworks,
    services,
    duplicatedModules,
    suspiciousPatterns,
    commitSummaries,
    apiSurface,
    dataCompleteness: calculateDataCompleteness({
      filePaths,
      dependencies,
      frameworks,
      services,
      commitSummaries,
      suspiciousPatterns,
      duplicatedModules,
    }),
  };
}

function synthesizeForensicIntelligence(
  normalized: NormalizedRepositoryIntelligence,
  maxEvidenceEntries = 14,
): ForensicIntelligence {
  const indicators = buildIndicators(normalized);
  const evidence = indicators
    .slice(0, maxEvidenceEntries)
    .map((indicator, index) => toEvidence(indicator, index));
  const architectureFindings = buildArchitectureFindings(normalized, evidence);
  const suspiciousPatterns = buildSuspiciousPatterns(normalized, evidence);
  const instabilitySignals = buildInstabilitySignals(normalized, evidence);
  const riskScore = calculateRiskScore(evidence, normalized);
  const integrityEstimate = clampScore(100 - riskScore + normalized.dataCompleteness / 5);
  const confidence = buildConfidence(normalized, evidence, riskScore, integrityEstimate);
  const engineeringAssessment = buildEngineeringAssessment(
    normalized,
    evidence,
    riskScore,
    integrityEstimate,
  );

  return {
    summary: buildExecutiveSummary(normalized, riskScore, engineeringAssessment),
    architectureFindings,
    suspiciousPatterns,
    instabilitySignals,
    evidence,
    confidence,
    engineeringAssessment,
  };
}

function buildIndicators(normalized: NormalizedRepositoryIntelligence): Indicator[] {
  return [
    ...detectDuplicatedAuthentication(normalized),
    ...detectDependencyInstability(normalized),
    ...detectArchitectureDrift(normalized),
    ...detectValidationBoundaryGaps(normalized),
    ...detectTightCoupling(normalized),
    ...detectScalingBottlenecks(normalized),
    ...detectInconsistentErrorHandling(normalized),
    ...detectDeadModules(normalized),
    ...detectServiceFragmentation(normalized),
    ...detectApiInstability(normalized),
  ];
}

function detectDuplicatedAuthentication(
  normalized: NormalizedRepositoryIntelligence,
): Indicator[] {
  const authLocations = findLocations(normalized, [
    "auth",
    "session",
    "jwt",
    "oauth",
    "middleware",
  ]);
  const duplicateHints = normalized.duplicatedModules.filter((moduleName) =>
    includesAny(moduleName.toLowerCase(), ["auth", "session", "jwt", "oauth"]),
  );

  if (authLocations.length < 2 && duplicateHints.length === 0) {
    return [];
  }

  return [
    {
      area: "authentication",
      title: "Duplicated authentication authority",
      description:
        "Authentication responsibility fragmented across multiple middleware, route, or service layers after rapid feature integration introduced architectural drift.",
      severity: authLocations.length > 3 ? "critical" : "high",
      confidence: clampScore(70 + authLocations.length * 5 + duplicateHints.length * 6),
      indicators: uniqueCompact([
        "multiple auth-bearing files",
        "session or token logic appears in separate zones",
        ...duplicateHints,
      ]),
      locations: authLocations,
      marker: "AUTHORITY_FRAGMENTATION",
    },
  ];
}

function detectDependencyInstability(
  normalized: NormalizedRepositoryIntelligence,
): Indicator[] {
  const unstableDependencies = normalized.dependencies.filter((dependency) => {
    const version = dependency.version ?? "";

    return (
      version === "*" ||
      version.toLowerCase() === "latest" ||
      version.startsWith(">") ||
      version.includes("beta") ||
      version.includes("alpha") ||
      version.includes("canary") ||
      version.includes("rc")
    );
  });
  const dependencyCommitSignals = normalized.commitSummaries.filter((commit) =>
    includesAny(commit.message.toLowerCase(), [
      "dependency",
      "upgrade",
      "downgrade",
      "package",
      "lockfile",
    ]),
  );

  if (unstableDependencies.length === 0 && dependencyCommitSignals.length === 0) {
    return [];
  }

  return [
    {
      area: "dependencies",
      title: "Dependency graph instability",
      description:
        "The dependency layer shows volatile versioning or repeated package churn, a classic precursor to runtime behavior diverging between local, CI, and production.",
      severity: unstableDependencies.length > 2 ? "high" : "medium",
      confidence: clampScore(64 + unstableDependencies.length * 7 + dependencyCommitSignals.length * 3),
      indicators: [
        ...unstableDependencies.map((dependency) =>
          `${dependency.name}@${dependency.version ?? "unknown"}`,
        ),
        ...dependencyCommitSignals.slice(0, 3).map((commit) => commit.message),
      ],
      locations: uniqueCompact(unstableDependencies.map((dependency) => dependency.source ?? "dependency-map")),
      marker: "DEPENDENCY_VOLATILITY",
    },
  ];
}

function detectArchitectureDrift(
  normalized: NormalizedRepositoryIntelligence,
): Indicator[] {
  const driftHints = normalized.suspiciousPatterns.filter((pattern) =>
    includesAny(pattern.toLowerCase(), ["drift", "legacy", "deprecated", "migration", "temporary"]),
  );
  const legacyLocations = findLocations(normalized, ["legacy", "deprecated", "old-", "v1", "migration"]);
  const commitSignals = normalized.commitSummaries.filter((commit) =>
    includesAny(commit.message.toLowerCase(), ["quick fix", "hotfix", "temporary", "migration", "legacy"]),
  );

  if (driftHints.length === 0 && legacyLocations.length === 0 && commitSignals.length === 0) {
    return [];
  }

  return [
    {
      area: "architecture",
      title: "Architecture drift after incremental repair",
      description:
        "The repository carries traces of legacy compatibility and tactical repair, suggesting the implemented topology no longer matches the intended system design.",
      severity: legacyLocations.length > 3 || commitSignals.length > 2 ? "high" : "medium",
      confidence: clampScore(67 + driftHints.length * 5 + legacyLocations.length * 4),
      indicators: uniqueCompact([
        ...driftHints,
        ...commitSignals.slice(0, 3).map((commit) => commit.message),
      ]),
      locations: legacyLocations,
      marker: "TOPOLOGY_DRIFT",
    },
  ];
}

function detectValidationBoundaryGaps(
  normalized: NormalizedRepositoryIntelligence,
): Indicator[] {
  const validationLocations = findLocations(normalized, [
    "validation",
    "validator",
    "schema",
    "zod",
    "yup",
    "sanitize",
  ]);
  const ingressLocations = findLocations(normalized, ["api", "route", "controller", "webhook", "handler"]);
  const suspiciousValidationHints = normalized.suspiciousPatterns.filter((pattern) =>
    includesAny(pattern.toLowerCase(), ["validation", "sanitize", "schema", "boundary"]),
  );

  if (ingressLocations.length === 0) {
    return [];
  }

  if (validationLocations.length === 0 || suspiciousValidationHints.length > 0) {
    return [
      {
        area: "validation",
        title: "Missing validation boundary",
        description:
          "Public ingress is visible, but the validation perimeter is either absent or fragmented. This creates a corridor where malformed data can reach privileged business logic.",
        severity: validationLocations.length === 0 ? "critical" : "high",
        confidence: clampScore(72 + ingressLocations.length * 3 + suspiciousValidationHints.length * 6),
        indicators: uniqueCompact([
          "API or webhook ingress detected",
          validationLocations.length === 0 ? "no canonical validation module detected" : "validation appears fragmented",
          ...suspiciousValidationHints,
        ]),
        locations: uniqueCompact([...ingressLocations.slice(0, 5), ...validationLocations.slice(0, 5)]),
        marker: "BOUNDARY_EROSION",
      },
    ];
  }

  return [];
}

function detectTightCoupling(normalized: NormalizedRepositoryIntelligence): Indicator[] {
  const sharedLocations = findLocations(normalized, ["shared", "common", "utils", "helpers", "core"]);
  const crossServiceLinks = normalized.services.flatMap((service) => service.communicatesWith ?? []);
  const importPressure = normalized.fileContents.filter((file) => {
    const imports = countMatches(file.content, /\bimport\b|\brequire\(/g);

    return imports >= 12;
  });

  if (sharedLocations.length < 4 && crossServiceLinks.length < 5 && importPressure.length === 0) {
    return [];
  }

  return [
    {
      area: "coupling",
      title: "Tight coupling across shared utility strata",
      description:
        "Shared modules appear to be carrying domain decisions across service lines, increasing the chance that a local change mutates behavior in distant execution paths.",
      severity: crossServiceLinks.length > 8 || importPressure.length > 2 ? "high" : "medium",
      confidence: clampScore(62 + sharedLocations.length * 3 + crossServiceLinks.length * 2 + importPressure.length * 6),
      indicators: uniqueCompact([
        `${sharedLocations.length} shared/common/core locations`,
        `${crossServiceLinks.length} declared service communication links`,
        `${importPressure.length} high-import-pressure files`,
      ]),
      locations: uniqueCompact([...sharedLocations.slice(0, 6), ...importPressure.map((file) => file.path)]),
      marker: "COUPLING_PRESSURE",
    },
  ];
}

function detectScalingBottlenecks(
  normalized: NormalizedRepositoryIntelligence,
): Indicator[] {
  const scalingLocations = findLocations(normalized, [
    "queue",
    "worker",
    "retry",
    "timeout",
    "rate-limit",
    "cron",
    "job",
    "cache",
  ]);
  const scalingServices = normalized.services.filter((service) =>
    service.type === "queue" || service.type === "worker" || includesAny(service.name.toLowerCase(), ["queue", "worker", "job"]),
  );

  if (scalingLocations.length === 0 && scalingServices.length === 0) {
    return [];
  }

  return [
    {
      area: "scaling",
      title: "Scaling bottleneck and replay pressure",
      description:
        "Queue, retry, or worker signals indicate the system may convert small provider delays into cascading backlog and timeout amplification.",
      severity: scalingLocations.length > 4 || scalingServices.length > 1 ? "high" : "medium",
      confidence: clampScore(66 + scalingLocations.length * 4 + scalingServices.length * 6),
      indicators: uniqueCompact([
        `${scalingLocations.length} scaling-pressure locations`,
        ...scalingServices.map((service) => service.name),
      ]),
      locations: uniqueCompact([...scalingLocations.slice(0, 7), ...scalingServices.map((service) => service.path ?? service.name)]),
      marker: "SATURATION_CORRIDOR",
    },
  ];
}

function detectInconsistentErrorHandling(
  normalized: NormalizedRepositoryIntelligence,
): Indicator[] {
  const errorLocations = findLocations(normalized, ["try", "catch", "throw", "error", "logger", "console.error"]);
  const riskyFiles = normalized.fileContents.filter((file) => {
    const throws = countMatches(file.content, /\bthrow\b/g);
    const catches = countMatches(file.content, /\bcatch\b/g);
    const consoleErrors = countMatches(file.content, /console\.error/g);

    return throws > 2 && catches === 0 || consoleErrors > 3;
  });

  if (riskyFiles.length === 0 && errorLocations.length < 6) {
    return [];
  }

  return [
    {
      area: "errors",
      title: "Inconsistent error handling",
      description:
        "Error behavior appears uneven across execution paths, which can turn recoverable faults into silent degradation or misleading incident telemetry.",
      severity: riskyFiles.length > 2 ? "high" : "medium",
      confidence: clampScore(58 + riskyFiles.length * 8 + errorLocations.length),
      indicators: uniqueCompact([
        `${errorLocations.length} error-handling signals`,
        `${riskyFiles.length} files with asymmetric throw/catch behavior`,
      ]),
      locations: uniqueCompact([...riskyFiles.map((file) => file.path), ...errorLocations.slice(0, 5)]),
      marker: "ERROR_SEMANTIC_SPLIT",
    },
  ];
}

function detectDeadModules(normalized: NormalizedRepositoryIntelligence): Indicator[] {
  const deadLocations = findLocations(normalized, [
    "unused",
    "dead",
    "orphan",
    "archive",
    "deprecated",
    "legacy",
  ]);

  if (deadLocations.length === 0) {
    return [];
  }

  return [
    {
      area: "dead-code",
      title: "Dead or orphaned modules remain in the blast zone",
      description:
        "Dormant modules remain close enough to active architecture to confuse ownership, resurrect stale assumptions, or mask the real failing path during incidents.",
      severity: deadLocations.length > 4 ? "medium" : "low",
      confidence: clampScore(61 + deadLocations.length * 4),
      indicators: [`${deadLocations.length} dead-code or legacy markers`],
      locations: deadLocations.slice(0, 8),
      marker: "ORPHANED_LOGIC",
    },
  ];
}

function detectServiceFragmentation(
  normalized: NormalizedRepositoryIntelligence,
): Indicator[] {
  const serviceNames = normalized.services.map((service) => service.name);
  const domainRoots = normalized.filePaths
    .map((path) => path.split(/[\\/]/)[0])
    .filter((segment) => includesAny(segment.toLowerCase(), ["apps", "services", "packages", "workers", "api"]));

  if (serviceNames.length < 5 && uniqueCompact(domainRoots).length < 3) {
    return [];
  }

  return [
    {
      area: "services",
      title: "Service fragmentation under unclear ownership",
      description:
        "The service map shows enough independent zones that ownership must be explicit. Without clear contracts, operational fixes will scatter across teams and modules.",
      severity: serviceNames.length > 7 ? "high" : "medium",
      confidence: clampScore(60 + serviceNames.length * 4 + uniqueCompact(domainRoots).length * 3),
      indicators: uniqueCompact([
        `${serviceNames.length} service signals`,
        ...serviceNames.slice(0, 6),
      ]),
      locations: normalized.services.map((service) => service.path ?? service.name).slice(0, 8),
      marker: "SERVICE_FRAGMENTATION",
    },
  ];
}

function detectApiInstability(normalized: NormalizedRepositoryIntelligence): Indicator[] {
  const apiLocations = uniqueCompact([
    ...normalized.apiSurface,
    ...findLocations(normalized, ["api", "route", "controller", "endpoint", "webhook", "rpc"]),
  ]);
  const versionLocations = apiLocations.filter((location) =>
    includesAny(location.toLowerCase(), ["v1", "v2", "legacy", "beta"]),
  );
  const apiCommitSignals = normalized.commitSummaries.filter((commit) =>
    includesAny(commit.message.toLowerCase(), ["api", "endpoint", "contract", "breaking", "webhook"]),
  );

  if (apiLocations.length === 0) {
    return [];
  }

  if (versionLocations.length === 0 && apiCommitSignals.length === 0 && apiLocations.length < 4) {
    return [];
  }

  return [
    {
      area: "api",
      title: "API contract instability",
      description:
        "The API surface shows version churn, webhook expansion, or endpoint sprawl. This is where architecture drift becomes user-visible failure.",
      severity: versionLocations.length > 2 || apiCommitSignals.length > 2 ? "high" : "medium",
      confidence: clampScore(63 + versionLocations.length * 5 + apiCommitSignals.length * 4),
      indicators: uniqueCompact([
        `${apiLocations.length} API surface signals`,
        ...apiCommitSignals.slice(0, 3).map((commit) => commit.message),
      ]),
      locations: apiLocations.slice(0, 10),
      marker: "CONTRACT_INSTABILITY",
    },
  ];
}

function toEvidence(indicator: Indicator, index: number): ForensicEvidence {
  return {
    id: `evidence-${index + 1}-${indicator.area}`,
    area: indicator.area,
    title: indicator.title,
    description: indicator.description,
    severity: indicator.severity,
    confidence: indicator.confidence,
    indicators: indicator.indicators,
    locations: indicator.locations,
    forensicMarker: indicator.marker,
  };
}

function buildArchitectureFindings(
  normalized: NormalizedRepositoryIntelligence,
  evidence: ForensicEvidence[],
): ArchitectureFinding[] {
  const evidenceByArea = groupEvidenceByArea(evidence);

  return FORENSIC_AREAS.flatMap((area) => {
    const areaEvidence = evidenceByArea.get(area) ?? [];

    if (areaEvidence.length === 0) {
      return [];
    }

    const leadEvidence = areaEvidence[0];

    return [
      {
        id: `finding-${area}`,
        area,
        title: findingTitle(area, leadEvidence),
        narrative: findingNarrative(area, normalized, leadEvidence),
        severity: highestSeverity(areaEvidence.map((item) => item.severity)),
        confidence: averageScore(areaEvidence.map((item) => item.confidence)),
        affectedZones: affectedZonesForArea(area, normalized, leadEvidence),
        evidenceIds: areaEvidence.map((item) => item.id),
        recommendation: recommendationForArea(area),
      },
    ];
  });
}

function buildSuspiciousPatterns(
  normalized: NormalizedRepositoryIntelligence,
  evidence: ForensicEvidence[],
): SuspiciousPatternFinding[] {
  const explicitPatterns = normalized.suspiciousPatterns.map((pattern, index) => ({
    id: `pattern-explicit-${index + 1}`,
    pattern,
    area: inferAreaFromText(pattern),
    severity: severityFromText(pattern),
    confidence: 72,
    explanation: `Repository intelligence directly flagged "${pattern}". GHOST TRACE treats this as declared smoke, not proven fire, until evidence correlation completes.`,
    evidenceIds: evidence
      .filter((item) => item.area === inferAreaFromText(pattern))
      .map((item) => item.id)
      .slice(0, 3),
  }));
  const evidencePatterns = evidence.map((item, index) => ({
    id: `pattern-evidence-${index + 1}`,
    pattern: item.forensicMarker,
    area: item.area,
    severity: item.severity,
    confidence: item.confidence,
    explanation: `${item.title}: ${item.description}`,
    evidenceIds: [item.id],
  }));

  return [...explicitPatterns, ...evidencePatterns].slice(0, 12);
}

function buildInstabilitySignals(
  normalized: NormalizedRepositoryIntelligence,
  evidence: ForensicEvidence[],
): InstabilitySignal[] {
  if (evidence.length === 0) {
    return [
      {
        id: "signal-insufficient-evidence",
        signal: "Insufficient repository telemetry",
        area: "architecture",
        severity: "medium",
        confidence: 55,
        blastRadius: "Unknown architecture zones",
        trigger: "Missing repository intelligence",
        evidenceIds: [],
      },
    ];
  }

  return evidence
    .filter((item) => item.severity !== "low")
    .slice(0, 8)
    .map((item, index) => ({
      id: `signal-${index + 1}-${item.area}`,
      signal: instabilitySignalName(item),
      area: item.area,
      severity: item.severity,
      confidence: item.confidence,
      blastRadius: blastRadiusForArea(item.area, normalized),
      trigger: triggerForArea(item.area),
      evidenceIds: [item.id],
    }));
}

function buildConfidence(
  normalized: NormalizedRepositoryIntelligence,
  evidence: ForensicEvidence[],
  riskScore: number,
  integrityEstimate: number,
): ForensicConfidence {
  const evidenceConfidence = evidence.length
    ? averageScore(evidence.map((item) => item.confidence))
    : 48;

  return {
    investigationConfidence: clampScore((evidenceConfidence + normalized.dataCompleteness) / 2),
    riskConfidence: clampScore(evidenceConfidence + riskScore / 10),
    architecturalIntegrityEstimate: integrityEstimate,
    dataCompleteness: normalized.dataCompleteness,
    method: "heuristic",
  };
}

function buildEngineeringAssessment(
  normalized: NormalizedRepositoryIntelligence,
  evidence: ForensicEvidence[],
  riskScore: number,
  integrityEstimate: number,
): EngineeringAssessment {
  const riskLevel = riskToSeverity(riskScore);
  const leadingEvidence = [...evidence].sort(
    (left, right) => severityWeight(right.severity) - severityWeight(left.severity),
  )[0];
  const rootCause = rootCauseForEvidence(leadingEvidence);

  return {
    riskLevel,
    degradationStage: degradationStage(riskScore),
    rootCause,
    collapseNarrative: buildCollapseNarrative(normalized, evidence, rootCause),
    blastRadius: buildBlastRadius(normalized, evidence),
    nextFailureMode: nextFailureMode(evidence),
    architecturalIntegrity:
      integrityEstimate >= 75
        ? "Architecture remains structurally coherent, with contained instability pockets."
        : integrityEstimate >= 50
          ? "Architecture is degraded: service boundaries still exist, but enforcement is inconsistent."
          : "Architecture is compromised: runtime responsibility has outgrown the visible design.",
    strategicRecommendation:
      "Stabilize the trust boundary first, consolidate duplicated ownership second, then freeze dependency and API contracts before scaling work resumes.",
  };
}

function buildExecutiveSummary(
  normalized: NormalizedRepositoryIntelligence,
  riskScore: number,
  assessment: EngineeringAssessment,
): string {
  const servicePhrase =
    normalized.services.length > 0
      ? `${normalized.services.length} service zones`
      : "an incomplete service map";
  const frameworkPhrase =
    normalized.frameworks.length > 0
      ? ` across ${normalized.frameworks.join(", ")}`
      : "";

  return `GHOST TRACE examined ${normalized.repositoryName} and reconstructed ${servicePhrase}${frameworkPhrase}. The primary forensic read is ${assessment.riskLevel.toUpperCase()} risk at ${riskScore}%: ${assessment.rootCause} ${assessment.collapseNarrative}`;
}

function mergeForensicReports(
  heuristicReport: ForensicIntelligence,
  aiReport: Partial<ForensicIntelligence>,
): ForensicIntelligence {
  return {
    summary: stringOrUndefined(aiReport.summary) ?? heuristicReport.summary,
    architectureFindings:
      validArray(aiReport.architectureFindings) ?? heuristicReport.architectureFindings,
    suspiciousPatterns:
      validArray(aiReport.suspiciousPatterns) ?? heuristicReport.suspiciousPatterns,
    instabilitySignals:
      validArray(aiReport.instabilitySignals) ?? heuristicReport.instabilitySignals,
    evidence: validArray(aiReport.evidence) ?? heuristicReport.evidence,
    confidence: {
      ...heuristicReport.confidence,
      ...aiReport.confidence,
      method: "ai-assisted",
      investigationConfidence: clampScore(
        aiReport.confidence?.investigationConfidence ??
          heuristicReport.confidence.investigationConfidence,
      ),
      riskConfidence: clampScore(
        aiReport.confidence?.riskConfidence ?? heuristicReport.confidence.riskConfidence,
      ),
      architecturalIntegrityEstimate: clampScore(
        aiReport.confidence?.architecturalIntegrityEstimate ??
          heuristicReport.confidence.architecturalIntegrityEstimate,
      ),
      dataCompleteness: clampScore(
        aiReport.confidence?.dataCompleteness ?? heuristicReport.confidence.dataCompleteness,
      ),
    },
    engineeringAssessment:
      aiReport.engineeringAssessment ?? heuristicReport.engineeringAssessment,
  };
}

function generateCinematicFallbackIntelligence(error?: unknown): ForensicIntelligence {
  const errorMessage = error instanceof Error ? error.message : "repository intelligence was incomplete";
  const evidence: ForensicEvidence[] = [
    {
      id: "fallback-evidence-auth",
      area: "authentication",
      title: "Duplicated auth middleware",
      description:
        "Fallback analysis detected the signature of split identity authority: session checks, token verification, and middleware ownership are likely distributed across competing layers.",
      severity: "critical",
      confidence: 82,
      indicators: ["duplicated auth middleware", "fragmented session validation", "competing trust boundaries"],
      locations: ["middleware/auth", "api/session", "workers/replay"],
      forensicMarker: "FALLBACK_AUTH_FRAGMENTATION",
    },
    {
      id: "fallback-evidence-validation",
      area: "validation",
      title: "Fragmented validation logic",
      description:
        "Input validation appears to have moved from a canonical boundary into local defensive checks, creating inconsistent request truth across API and worker paths.",
      severity: "high",
      confidence: 79,
      indicators: ["missing canonical schema", "webhook ingress pressure", "worker replay ambiguity"],
      locations: ["api/routes", "webhooks", "queue/consumers"],
      forensicMarker: "FALLBACK_BOUNDARY_FRAGMENTATION",
    },
    {
      id: "fallback-evidence-dependencies",
      area: "dependencies",
      title: "Dependency volatility",
      description:
        "The package layer carries enough uncertainty to preserve demo continuity as a dependency instability finding until live analysis recovers.",
      severity: "medium",
      confidence: 68,
      indicators: ["lockfile uncertainty", "runtime parity risk", "upgrade pressure"],
      locations: ["package graph"],
      forensicMarker: "FALLBACK_DEPENDENCY_VOLATILITY",
    },
  ];

  return {
    summary:
      "GHOST TRACE lost live analytical telemetry and switched to cinematic fallback mode. The investigation remains coherent: the strongest reconstructed failure path is duplicated trust authority, fragmented validation, and dependency pressure converging into architectural drift.",
    architectureFindings: [
      {
        id: "fallback-finding-architecture",
        area: "architecture",
        title: "Architecture degraded under split ownership",
        narrative:
          "The system reads like an engineering incident in slow motion: responsibilities were duplicated to move fast, then the duplicates became indistinguishable from the architecture.",
        severity: "high",
        confidence: 78,
        affectedZones: ["auth", "api", "workers", "dependency graph"],
        evidenceIds: evidence.map((item) => item.id),
        recommendation:
          "Rebuild the forensic trace with live repository data, then immediately consolidate auth and validation ownership.",
      },
    ],
    suspiciousPatterns: evidence.map((item, index) => ({
      id: `fallback-pattern-${index + 1}`,
      pattern: item.forensicMarker,
      area: item.area,
      severity: item.severity,
      confidence: item.confidence,
      explanation: item.description,
      evidenceIds: [item.id],
    })),
    instabilitySignals: [
      {
        id: "fallback-signal-collapse-corridor",
        signal: "Trust boundary collapse corridor",
        area: "authentication",
        severity: "critical",
        confidence: 81,
        blastRadius: "Authentication, API ingress, background workers, and incident response",
        trigger: "Live AI analysis failure forced deterministic fallback intelligence",
        evidenceIds: ["fallback-evidence-auth", "fallback-evidence-validation"],
      },
    ],
    evidence,
    confidence: {
      investigationConfidence: 76,
      riskConfidence: 79,
      architecturalIntegrityEstimate: 42,
      dataCompleteness: 35,
      method: "cinematic-fallback",
    },
    engineeringAssessment: {
      riskLevel: "high",
      degradationStage: "Fallback reconstruction after live analysis failure",
      rootCause: `Live forensic analysis failed because ${errorMessage}; fallback evidence indicates architectural drift around trust and validation boundaries.`,
      collapseNarrative:
        "The failure pattern remains believable: duplicated auth logic created inconsistent authority, fragmented validation widened the ingress corridor, and dependency uncertainty made the blast radius harder to predict.",
      blastRadius: "Auth, API, queue replay, deployment confidence, and engineering incident response",
      nextFailureMode:
        "Intermittent authorization or webhook replay failure that appears operational but originates in architecture.",
      architecturalIntegrity:
        "Integrity cannot be trusted until live repository evidence is restored and boundary ownership is verified.",
      strategicRecommendation:
        "Preserve the demo experience, flag the fallback state clearly, and rerun live analysis as soon as provider telemetry returns.",
    },
  };
}

function normalizeFiles(files: RepositoryIntelligence["files"]): RepositoryFileSignal[] {
  if (!Array.isArray(files)) {
    return [];
  }

  return files.filter(isRecord).map((file) => ({
    path: stringOrUndefined(file.path),
    name: stringOrUndefined(file.name),
    content: stringOrUndefined(file.content),
    language: stringOrUndefined(file.language),
    sizeBytes: typeof file.sizeBytes === "number" ? file.sizeBytes : undefined,
    imports: normalizeStringArray(file.imports),
    exports: normalizeStringArray(file.exports),
  }));
}

function normalizeDependencies(
  dependencies: RepositoryIntelligence["dependencies"],
  dependencyMap: unknown,
): RepositoryDependencySignal[] {
  const directDependencies = Array.isArray(dependencies)
    ? dependencies.map((dependency) => normalizeDependency(dependency)).filter(isDefined)
    : [];
  const mappedDependencies = dependencyMapToSignals(dependencyMap);

  return dedupeDependencies([...directDependencies, ...mappedDependencies]);
}

function normalizeDependency(
  dependency: RepositoryDependencySignal | string,
): RepositoryDependencySignal | undefined {
  if (typeof dependency === "string") {
    return { name: dependency, scope: "unknown" };
  }

  if (!isRecord(dependency) || typeof dependency.name !== "string") {
    return undefined;
  }

  return {
    name: dependency.name,
    version: stringOrUndefined(dependency.version),
    scope: normalizeDependencyScope(dependency.scope),
    source: stringOrUndefined(dependency.source),
  };
}

function dependencyMapToSignals(dependencyMap: unknown): RepositoryDependencySignal[] {
  if (!dependencyMap) {
    return [];
  }

  if (Array.isArray(dependencyMap)) {
    return dependencyMap.map((dependency) => normalizeDependencyValue(dependency)).filter(isDefined);
  }

  if (!isRecord(dependencyMap)) {
    return [];
  }

  return Object.entries(dependencyMap).flatMap(([scope, value]) => {
    if (Array.isArray(value)) {
      return value.map((dependency) => normalizeDependencyValue(dependency, scope)).filter(isDefined);
    }

    if (isRecord(value)) {
      return Object.entries(value).map(([name, version]) => ({
        name,
        version: typeof version === "string" ? version : undefined,
        scope: normalizeDependencyScope(scope),
        source: "dependencyMap",
      }));
    }

    if (typeof value === "string") {
      return [
        {
          name: scope,
          version: value,
          scope: "unknown" as const,
          source: "dependencyMap",
        },
      ];
    }

    return [];
  });
}

function normalizeDependencyValue(
  value: unknown,
  scope = "unknown",
): RepositoryDependencySignal | undefined {
  if (typeof value === "string") {
    return {
      name: value,
      scope: normalizeDependencyScope(scope),
      source: "dependencyMap",
    };
  }

  if (isRecord(value) && typeof value.name === "string") {
    return {
      name: value.name,
      version: stringOrUndefined(value.version),
      scope: normalizeDependencyScope(value.scope ?? scope),
      source: stringOrUndefined(value.source) ?? "dependencyMap",
    };
  }

  return undefined;
}

function normalizeDependencyScope(value: unknown): RepositoryDependencySignal["scope"] {
  if (
    value === "production" ||
    value === "development" ||
    value === "peer" ||
    value === "optional" ||
    value === "unknown"
  ) {
    return value;
  }

  if (value === "dependencies") {
    return "production";
  }

  if (value === "devDependencies") {
    return "development";
  }

  if (value === "peerDependencies") {
    return "peer";
  }

  if (value === "optionalDependencies") {
    return "optional";
  }

  return "unknown";
}

function normalizeServices(
  services: RepositoryIntelligence["services"],
  serviceArchitecture: unknown,
  filePaths: string[],
): RepositoryServiceSignal[] {
  const directServices = Array.isArray(services)
    ? services.filter(isRecord).map((service) => ({
        name: typeof service.name === "string" ? service.name : "unknown-service",
        type: normalizeServiceType(service.type),
        path: stringOrUndefined(service.path),
        dependencies: normalizeStringArray(service.dependencies),
        communicatesWith: normalizeStringArray(service.communicatesWith),
      }))
    : [];
  const architectureServices = serviceArchitectureToSignals(serviceArchitecture);
  const inferredServices = inferServices(filePaths);

  return dedupeServices([...directServices, ...architectureServices, ...inferredServices]);
}

function serviceArchitectureToSignals(serviceArchitecture: unknown): RepositoryServiceSignal[] {
  if (!serviceArchitecture) {
    return [];
  }

  if (Array.isArray(serviceArchitecture)) {
    return serviceArchitecture
      .filter(isRecord)
      .map((service) => ({
        name: stringOrUndefined(service.name) ?? stringOrUndefined(service.id) ?? "unknown-service",
        type: normalizeServiceType(service.type),
        path: stringOrUndefined(service.path),
        dependencies: normalizeStringArray(service.dependencies),
        communicatesWith: normalizeStringArray(service.communicatesWith ?? service.connections),
      }));
  }

  if (!isRecord(serviceArchitecture)) {
    return [];
  }

  const nodes = Array.isArray(serviceArchitecture.nodes) ? serviceArchitecture.nodes : [];

  return nodes.filter(isRecord).map((node) => ({
    name: stringOrUndefined(node.name) ?? stringOrUndefined(node.id) ?? "unknown-service",
    type: normalizeServiceType(node.type),
    path: stringOrUndefined(node.path),
    dependencies: normalizeStringArray(node.dependencies),
    communicatesWith: normalizeStringArray(node.communicatesWith ?? node.connections),
  }));
}

function normalizeServiceType(value: unknown): RepositoryServiceSignal["type"] {
  if (
    value === "frontend" ||
    value === "api" ||
    value === "service" ||
    value === "database" ||
    value === "queue" ||
    value === "worker" ||
    value === "auth" ||
    value === "external" ||
    value === "unknown"
  ) {
    return value;
  }

  return "unknown";
}

function normalizeCommits(
  commitSummaries: RepositoryIntelligence["commitSummaries"],
): RepositoryCommitSignal[] {
  if (!Array.isArray(commitSummaries)) {
    return [];
  }

  return commitSummaries
    .map((commit) => {
      if (typeof commit === "string") {
        return { message: commit };
      }

      if (!isRecord(commit) || typeof commit.message !== "string") {
        return undefined;
      }

      return {
        hash: stringOrUndefined(commit.hash),
        message: commit.message,
        author: stringOrUndefined(commit.author),
        date: stringOrUndefined(commit.date),
        filesChanged: normalizeStringArray(commit.filesChanged),
      };
    })
    .filter(isDefined);
}

function extractFilePaths(fileStructure: unknown): string[] {
  if (!fileStructure) {
    return [];
  }

  if (typeof fileStructure === "string") {
    return fileStructure
      .split(/\r?\n/)
      .map((line) => line.replace(/[|`+\\-]/g, "").trim())
      .filter((line) => /\.[a-z0-9]+$/i.test(line) || line.includes("/"));
  }

  if (Array.isArray(fileStructure)) {
    return fileStructure.flatMap((entry) => extractFilePaths(entry));
  }

  if (!isRecord(fileStructure)) {
    return [];
  }

  const pathCandidates = ["path", "name", "file", "filename"].flatMap((key) =>
    typeof fileStructure[key] === "string" ? [fileStructure[key]] : [],
  );
  const childCandidates = ["children", "files", "directories", "items"].flatMap((key) =>
    Array.isArray(fileStructure[key])
      ? (fileStructure[key] as unknown[]).flatMap((child) => extractFilePaths(child))
      : [],
  );
  const objectCandidates = Object.values(fileStructure).flatMap((value) =>
    isRecord(value) || Array.isArray(value) ? extractFilePaths(value) : [],
  );

  return uniqueCompact([...pathCandidates, ...childCandidates, ...objectCandidates]);
}

function inferFrameworks(
  filePaths: string[],
  dependencies: RepositoryDependencySignal[],
  files: RepositoryFileSignal[],
): string[] {
  const pathCorpus = filePaths.join("\n").toLowerCase();
  const dependencyNames = dependencies.map((dependency) => dependency.name.toLowerCase());
  const contentCorpus = files.map((file) => file.content ?? "").join("\n").toLowerCase().slice(0, 80_000);
  const corpus = `${pathCorpus}\n${dependencyNames.join("\n")}\n${contentCorpus}`;

  return uniqueCompact([
    includesAny(corpus, ["next.config", "next/", "next\""]) ? "Next.js" : "",
    includesAny(corpus, ["react", "tsx"]) ? "React" : "",
    includesAny(corpus, ["express"]) ? "Express" : "",
    includesAny(corpus, ["nestjs", "@nestjs"]) ? "NestJS" : "",
    includesAny(corpus, ["prisma"]) ? "Prisma" : "",
    includesAny(corpus, ["tailwind"]) ? "Tailwind CSS" : "",
    includesAny(corpus, ["vite"]) ? "Vite" : "",
    includesAny(corpus, ["django"]) ? "Django" : "",
    includesAny(corpus, ["fastapi"]) ? "FastAPI" : "",
  ]);
}

function inferServices(filePaths: string[]): RepositoryServiceSignal[] {
  const lowerPaths = filePaths.map((path) => path.toLowerCase());
  const services: RepositoryServiceSignal[] = [];

  if (lowerPaths.some((path) => includesAny(path, ["app/", "pages/", "components/", "frontend", "web/"]))) {
    services.push({ name: "Frontend Surface", type: "frontend", path: "app|pages|components" });
  }

  if (lowerPaths.some((path) => includesAny(path, ["api/", "route.ts", "controller", "routes/"]))) {
    services.push({ name: "API Surface", type: "api", path: "api routes" });
  }

  if (lowerPaths.some((path) => includesAny(path, ["auth", "session", "jwt", "oauth"]))) {
    services.push({ name: "Authentication", type: "auth", path: "auth/session paths" });
  }

  if (lowerPaths.some((path) => includesAny(path, ["db", "database", "prisma", "schema.sql", "migration"]))) {
    services.push({ name: "Data Layer", type: "database", path: "database paths" });
  }

  if (lowerPaths.some((path) => includesAny(path, ["queue", "worker", "job", "cron"]))) {
    services.push({ name: "Async Workers", type: "worker", path: "queue/worker paths" });
  }

  return services;
}

function inferSuspiciousPatternHints(
  filePaths: string[],
  files: RepositoryFileSignal[],
  commits: RepositoryCommitSignal[],
): string[] {
  const pathCorpus = filePaths.join("\n").toLowerCase();
  const contentCorpus = files.map((file) => file.content ?? "").join("\n").toLowerCase().slice(0, 80_000);
  const commitCorpus = commits.map((commit) => commit.message).join("\n").toLowerCase();
  const corpus = `${pathCorpus}\n${contentCorpus}\n${commitCorpus}`;

  return uniqueCompact([
    includesAny(corpus, ["todo", "fixme", "hack"]) ? "unresolved engineering markers" : "",
    includesAny(corpus, ["eslint-disable", "ts-ignore", ": any", " as any"]) ? "type-safety bypasses" : "",
    includesAny(corpus, ["legacy", "deprecated"]) ? "legacy compatibility residue" : "",
    includesAny(corpus, ["quick fix", "hotfix", "temporary"]) ? "tactical repair trail" : "",
    includesAny(corpus, ["retry", "timeout", "queue"]) ? "runtime retry pressure" : "",
    includesAny(corpus, ["webhook", "public endpoint"]) ? "expanded external ingress" : "",
  ]);
}

function inferDuplicatedModules(
  filePaths: string[],
  files: RepositoryFileSignal[],
): string[] {
  const corpus = `${filePaths.join("\n")}\n${files.map((file) => file.content ?? "").join("\n").slice(0, 80_000)}`.toLowerCase();

  return ["auth", "validation", "config", "logger", "api", "client", "middleware"]
    .filter((moduleName) => {
      const pathHits = filePaths.filter((path) => path.toLowerCase().includes(moduleName)).length;
      const contentHits = countMatches(corpus, new RegExp(`\\b${moduleName}\\b`, "g"));

      return pathHits > 1 || contentHits > 5;
    })
    .map((moduleName) => `${moduleName} authority appears duplicated`);
}

function extractApiSurface(apiSurface: unknown, filePaths: string[]): string[] {
  const explicitSurface = normalizeUnknownStringValues(apiSurface);
  const inferredSurface = filePaths.filter((path) =>
    includesAny(path.toLowerCase(), ["api/", "route.ts", "controller", "endpoint", "webhook", "rpc"]),
  );

  return uniqueCompact([...explicitSurface, ...inferredSurface]);
}

function calculateDataCompleteness(input: {
  filePaths: string[];
  dependencies: RepositoryDependencySignal[];
  frameworks: string[];
  services: RepositoryServiceSignal[];
  commitSummaries: RepositoryCommitSignal[];
  suspiciousPatterns: string[];
  duplicatedModules: string[];
}): number {
  const dimensions = [
    input.filePaths.length > 0,
    input.dependencies.length > 0,
    input.frameworks.length > 0,
    input.services.length > 0,
    input.commitSummaries.length > 0,
    input.suspiciousPatterns.length > 0 || input.duplicatedModules.length > 0,
  ];

  return clampScore((dimensions.filter(Boolean).length / dimensions.length) * 100);
}

function buildInvestigationContext(
  normalized: NormalizedRepositoryIntelligence,
): ForensicInvestigationContext {
  return {
    repositoryName: normalized.repositoryName,
    filePaths: normalized.filePaths,
    dependencyNames: normalized.dependencies.map((dependency) => dependency.name),
    frameworks: normalized.frameworks,
    services: normalized.services.map((service) => service.name),
    duplicateHints: normalized.duplicatedModules,
    suspiciousHints: normalized.suspiciousPatterns,
    commitMessages: normalized.commitSummaries.map((commit) => commit.message),
    dataCompleteness: normalized.dataCompleteness,
  };
}

function findLocations(
  normalized: NormalizedRepositoryIntelligence,
  terms: string[],
): string[] {
  const lowerTerms = terms.map((term) => term.toLowerCase());
  const pathLocations = normalized.filePaths.filter((path) =>
    lowerTerms.some((term) => path.toLowerCase().includes(term)),
  );
  const contentLocations = normalized.fileContents
    .filter((file) => lowerTerms.some((term) => file.content.toLowerCase().includes(term)))
    .map((file) => file.path);
  const serviceLocations = normalized.services
    .filter((service) => lowerTerms.some((term) => service.name.toLowerCase().includes(term)))
    .map((service) => service.path ?? service.name);

  return uniqueCompact([...pathLocations, ...contentLocations, ...serviceLocations]);
}

function groupEvidenceByArea(evidence: ForensicEvidence[]): Map<ForensicArea, ForensicEvidence[]> {
  return evidence.reduce((groups, item) => {
    const current = groups.get(item.area) ?? [];
    groups.set(item.area, [...current, item]);

    return groups;
  }, new Map<ForensicArea, ForensicEvidence[]>());
}

function findingTitle(area: ForensicArea, evidence: ForensicEvidence): string {
  const titles: Record<ForensicArea, string> = {
    authentication: "Authentication authority fractured",
    dependencies: "Dependency layer became unstable",
    architecture: "Architecture drift crossed the containment line",
    validation: "Validation boundary is not enforceable",
    coupling: "Coupling pressure is amplifying change risk",
    scaling: "Scaling path contains a saturation corridor",
    errors: "Error semantics are inconsistent",
    "dead-code": "Dead modules remain operationally relevant",
    services: "Service ownership is fragmented",
    api: "API contracts are unstable",
  };

  return titles[area] ?? evidence.title;
}

function findingNarrative(
  area: ForensicArea,
  normalized: NormalizedRepositoryIntelligence,
  evidence: ForensicEvidence,
): string {
  const repository = normalized.repositoryName;
  const serviceCount = normalized.services.length;
  const narratives: Record<ForensicArea, string> = {
    authentication:
      `Authentication in ${repository} no longer reads as a single authority. ${evidence.description}`,
    dependencies:
      `The dependency map behaves like shifting ground beneath ${repository}. ${evidence.description}`,
    architecture:
      `Architecture drift is visible in the residue of legacy paths, tactical commits, or migration fragments. ${evidence.description}`,
    validation:
      `Validation should be the checkpoint before trust begins. In this repository, that checkpoint appears fragmented or missing. ${evidence.description}`,
    coupling:
      `Coupling pressure is pulling distant modules into the same failure story across ${serviceCount || "multiple"} service zones. ${evidence.description}`,
    scaling:
      `The scaling risk is not just traffic volume; it is replay pressure meeting unclear ownership. ${evidence.description}`,
    errors:
      `Incident response will struggle if failures are thrown, logged, and recovered differently across the same request path. ${evidence.description}`,
    "dead-code":
      `Dead modules are not harmless when they stay near active execution paths. ${evidence.description}`,
    services:
      `Service fragmentation is becoming an organizational problem expressed as code. ${evidence.description}`,
    api:
      `The API surface is where internal drift becomes external instability. ${evidence.description}`,
  };

  return narratives[area];
}

function affectedZonesForArea(
  area: ForensicArea,
  normalized: NormalizedRepositoryIntelligence,
  evidence: ForensicEvidence,
): string[] {
  const services = normalized.services.map((service) => service.name);
  const defaults: Record<ForensicArea, string[]> = {
    authentication: ["auth", "middleware", "api", "workers"],
    dependencies: ["build pipeline", "runtime packages", "CI", "deployment"],
    architecture: ["service topology", "ownership boundaries", "shared modules"],
    validation: ["api ingress", "webhooks", "queue consumers"],
    coupling: ["shared utilities", "domain services", "release workflow"],
    scaling: ["workers", "queues", "database", "external providers"],
    errors: ["observability", "incident response", "route handlers"],
    "dead-code": ["legacy modules", "archive paths", "migration residue"],
    services: services.length ? services : ["service architecture"],
    api: ["public API", "internal API", "webhooks", "clients"],
  };

  return uniqueCompact([...defaults[area], ...evidence.locations.slice(0, 3)]);
}

function recommendationForArea(area: ForensicArea): string {
  const recommendations: Record<ForensicArea, string> = {
    authentication:
      "Collapse all session, token, and authorization decisions into one auditable authority with explicit adapter boundaries.",
    dependencies:
      "Freeze volatile packages, inspect lockfile drift, and run production-parity dependency resolution before the next release.",
    architecture:
      "Re-map intended ownership against runtime behavior and remove compatibility paths that no longer have a named owner.",
    validation:
      "Create a canonical validation boundary for every public ingress and require workers to consume validated contracts only.",
    coupling:
      "Split shared utilities into domain-safe packages and block cross-service imports that bypass public contracts.",
    scaling:
      "Add backpressure, idempotency, retry budgets, and queue saturation alerts before increasing traffic exposure.",
    errors:
      "Standardize error taxonomy, recovery behavior, and telemetry fields across API, service, and worker execution.",
    "dead-code":
      "Quarantine or delete orphaned modules, then add ownership metadata for every remaining legacy path.",
    services:
      "Assign explicit service owners and enforce communication through declared contracts rather than shared internals.",
    api:
      "Version the API contract deliberately, remove legacy ambiguity, and add compatibility tests for every client-facing path.",
  };

  return recommendations[area];
}

function calculateRiskScore(
  evidence: ForensicEvidence[],
  normalized: NormalizedRepositoryIntelligence,
): number {
  if (evidence.length === 0) {
    return normalized.dataCompleteness < 40 ? 52 : 28;
  }

  const severityScore = evidence.reduce(
    (total, item) => total + severityWeight(item.severity) * (item.confidence / 100),
    0,
  );
  const servicePressure = Math.min(normalized.services.length * 2, 14);
  const duplicatePressure = Math.min(normalized.duplicatedModules.length * 4, 18);
  const suspiciousPressure = Math.min(normalized.suspiciousPatterns.length * 3, 15);

  return clampScore(18 + severityScore + servicePressure + duplicatePressure + suspiciousPressure);
}

function riskToSeverity(riskScore: number): ForensicSeverity {
  if (riskScore >= 82) {
    return "critical";
  }

  if (riskScore >= 64) {
    return "high";
  }

  if (riskScore >= 38) {
    return "medium";
  }

  return "low";
}

function severityFromText(text: string): ForensicSeverity {
  const lower = text.toLowerCase();

  if (includesAny(lower, ["critical", "breach", "collapse", "unsafe", "auth"])) {
    return "critical";
  }

  if (includesAny(lower, ["high", "drift", "fragment", "missing", "unstable"])) {
    return "high";
  }

  if (includesAny(lower, ["medium", "deprecated", "legacy", "retry"])) {
    return "medium";
  }

  return "low";
}

function highestSeverity(severities: ForensicSeverity[]): ForensicSeverity {
  return severities.sort((left, right) => severityWeight(right) - severityWeight(left))[0] ?? "low";
}

function severityWeight(severity: ForensicSeverity): number {
  const weights: Record<ForensicSeverity, number> = {
    low: 8,
    medium: 16,
    high: 25,
    critical: 34,
  };

  return weights[severity];
}

function inferAreaFromText(text: string): ForensicArea {
  const lower = text.toLowerCase();

  if (includesAny(lower, ["auth", "session", "jwt", "oauth"])) {
    return "authentication";
  }

  if (includesAny(lower, ["dependency", "package", "lockfile", "version"])) {
    return "dependencies";
  }

  if (includesAny(lower, ["validation", "schema", "sanitize", "boundary"])) {
    return "validation";
  }

  if (includesAny(lower, ["queue", "worker", "retry", "timeout", "scale"])) {
    return "scaling";
  }

  if (includesAny(lower, ["api", "endpoint", "webhook", "contract"])) {
    return "api";
  }

  if (includesAny(lower, ["error", "throw", "catch", "logger"])) {
    return "errors";
  }

  if (includesAny(lower, ["dead", "unused", "orphan", "deprecated", "legacy"])) {
    return "dead-code";
  }

  if (includesAny(lower, ["service", "worker", "fragment"])) {
    return "services";
  }

  if (includesAny(lower, ["shared", "coupling", "common"])) {
    return "coupling";
  }

  return "architecture";
}

function degradationStage(riskScore: number): string {
  if (riskScore >= 82) {
    return "Active collapse conditions detected";
  }

  if (riskScore >= 64) {
    return "Pre-collapse architecture drift";
  }

  if (riskScore >= 38) {
    return "Recoverable instability with visible fracture lines";
  }

  return "Stable with isolated forensic concerns";
}

function rootCauseForEvidence(evidence?: ForensicEvidence): string {
  if (!evidence) {
    return "Repository evidence is too thin to convict a single subsystem, but the absence of telemetry is itself an operational risk.";
  }

  const roots: Record<ForensicArea, string> = {
    authentication:
      "The probable root cause is duplicated trust authority: authentication decisions are being made in more than one architectural location.",
    dependencies:
      "The probable root cause is dependency volatility: runtime contracts may be shifting underneath stable-looking source code.",
    architecture:
      "The probable root cause is architecture drift: the implemented topology has diverged from the system the team thinks it is operating.",
    validation:
      "The probable root cause is a missing validation perimeter: untrusted input can cross boundaries without a single canonical verdict.",
    coupling:
      "The probable root cause is shared-module overreach: domain behavior escaped into utilities that too many services trust.",
    scaling:
      "The probable root cause is unbounded replay pressure: retries and worker throughput can amplify small failures into systemic incidents.",
    errors:
      "The probable root cause is inconsistent error semantics: failures do not mean the same thing across execution paths.",
    "dead-code":
      "The probable root cause is orphaned logic: obsolete modules still influence architecture decisions and incident interpretation.",
    services:
      "The probable root cause is fragmented service ownership: responsibility is distributed more widely than the contracts can support.",
    api:
      "The probable root cause is API contract instability: external and internal callers are depending on a moving boundary.",
  };

  return roots[evidence.area];
}

function buildCollapseNarrative(
  normalized: NormalizedRepositoryIntelligence,
  evidence: ForensicEvidence[],
  rootCause: string,
): string {
  const markers = evidence.map((item) => item.forensicMarker).slice(0, 4);
  const commits =
    normalized.commitSummaries.length > 0
      ? ` Commit history adds pressure through ${normalized.commitSummaries
          .slice(0, 2)
          .map((commit) => `"${commit.message}"`)
          .join(" and ")}.`
      : "";

  return `${rootCause} The forensic chain is layered: ${markers.join(", ") || "insufficient telemetry"}, then operational pressure makes the fracture visible.${commits}`;
}

function buildBlastRadius(
  normalized: NormalizedRepositoryIntelligence,
  evidence: ForensicEvidence[],
): string {
  const zones = uniqueCompact([
    ...normalized.services.map((service) => service.name),
    ...evidence.flatMap((item) => affectedZonesForArea(item.area, normalized, item).slice(0, 2)),
  ]).slice(0, 8);

  return zones.length > 0 ? zones.join(", ") : "Unknown blast radius due to incomplete repository intelligence";
}

function nextFailureMode(evidence: ForensicEvidence[]): string {
  const areas = new Set(evidence.map((item) => item.area));

  if (areas.has("authentication") && areas.has("validation")) {
    return "Authorization inconsistency triggered by malformed or replayed input.";
  }

  if (areas.has("scaling") && areas.has("dependencies")) {
    return "Latency cascade triggered by dependency/runtime mismatch under queue pressure.";
  }

  if (areas.has("api")) {
    return "Client-facing API regression caused by unstable contract evolution.";
  }

  if (areas.has("errors")) {
    return "Silent production degradation masked by inconsistent error handling.";
  }

  return "Architecture drift surfacing as an intermittent production-only failure.";
}

function instabilitySignalName(evidence: ForensicEvidence): string {
  const names: Record<ForensicArea, string> = {
    authentication: "Trust authority split",
    dependencies: "Runtime dependency volatility",
    architecture: "Topology drift",
    validation: "Ingress boundary erosion",
    coupling: "Shared-domain coupling pressure",
    scaling: "Retry and saturation corridor",
    errors: "Telemetry and recovery inconsistency",
    "dead-code": "Orphaned logic near active paths",
    services: "Service ownership fragmentation",
    api: "Contract instability",
  };

  return names[evidence.area];
}

function blastRadiusForArea(
  area: ForensicArea,
  normalized: NormalizedRepositoryIntelligence,
): string {
  const zones = affectedZonesForArea(area, normalized, {
    id: "",
    area,
    title: "",
    description: "",
    severity: "low",
    confidence: 0,
    indicators: [],
    locations: [],
    forensicMarker: "",
  });

  return zones.slice(0, 5).join(", ");
}

function triggerForArea(area: ForensicArea): string {
  const triggers: Record<ForensicArea, string> = {
    authentication: "Role-model change, session refresh, or SSO integration under load",
    dependencies: "Package upgrade, cold build, or environment-specific dependency resolution",
    architecture: "Feature integration that bypasses the intended ownership boundary",
    validation: "Webhook expansion, new public route, or worker replay path",
    coupling: "Shared helper change reused by unrelated service domains",
    scaling: "Traffic spike, provider timeout, retry storm, or queue backlog",
    errors: "Partial outage where different services classify the same failure differently",
    "dead-code": "Legacy path accidentally reactivated during migration or incident repair",
    services: "Cross-team release where ownership is assumed rather than declared",
    api: "Client contract change, endpoint version split, or webhook payload mutation",
  };

  return triggers[area];
}

function dedupeDependencies(
  dependencies: RepositoryDependencySignal[],
): RepositoryDependencySignal[] {
  const seen = new Set<string>();

  return dependencies.filter((dependency) => {
    const key = `${dependency.name}:${dependency.scope ?? "unknown"}`;

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function dedupeServices(services: RepositoryServiceSignal[]): RepositoryServiceSignal[] {
  const seen = new Set<string>();

  return services.filter((service) => {
    const key = `${service.name}:${service.type ?? "unknown"}`;

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function normalizeUnknownStringValues(value: unknown): string[] {
  if (!value) {
    return [];
  }

  if (typeof value === "string") {
    return [value];
  }

  if (Array.isArray(value)) {
    return value.flatMap((item) => normalizeUnknownStringValues(item));
  }

  if (isRecord(value)) {
    return Object.values(value).flatMap((item) => normalizeUnknownStringValues(item));
  }

  return [];
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return uniqueCompact(value.filter((item): item is string => typeof item === "string"));
}

function inferRepositoryName(repositoryUrl?: unknown): string | undefined {
  if (typeof repositoryUrl !== "string" || !repositoryUrl.trim()) {
    return undefined;
  }

  return repositoryUrl
    .replace(/\.git$/i, "")
    .split("/")
    .filter(Boolean)
    .at(-1);
}

function stringOrUndefined(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}

function stripJsonFence(content: string): string {
  return content
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();
}

function validArray<T>(value: T[] | undefined): T[] | undefined {
  return Array.isArray(value) && value.length > 0 ? value : undefined;
}

function includesAny(value: string, terms: string[]): boolean {
  return terms.some((term) => value.includes(term));
}

function uniqueCompact(values: Array<string | undefined>): string[] {
  return Array.from(new Set(values.map((value) => value?.trim()).filter(isDefined)));
}

function averageScore(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }

  return clampScore(values.reduce((total, value) => total + value, 0) / values.length);
}

function clampScore(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(value)));
}

function countMatches(value: string, pattern: RegExp): number {
  return Array.from(value.matchAll(pattern)).length;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isDefined<T>(value: T | undefined | null | ""): value is T {
  return value !== undefined && value !== null && value !== "";
}

export default forensic;

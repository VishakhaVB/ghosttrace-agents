/**
 * Shared domain contracts for the GHOST TRACE AI forensic intelligence platform.
 *
 * These types model the investigation engine, agent council, architecture graph,
 * risk scanner, timeline reconstruction, final verdict, and API surface.
 */

// ---------------------------------------------------------------------------
// Core Primitives
// ---------------------------------------------------------------------------

export type ISODateTimeString = string;
export type TimestampLabel = string;
export type PercentageScore = number;
export type ConfidenceScore = number;
export type EntityId = string;

export type RiskSeverity = "low" | "medium" | "high" | "critical";
export type ApiSeverityLevel = "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
export type VerdictSeverity = RiskSeverity;
export type TimelineSeverity = RiskSeverity | ApiSeverityLevel;

export type SystemStatus =
  | "offline"
  | "initializing"
  | "online"
  | "degraded"
  | "investigating"
  | "warning"
  | "critical";

export type LoadingState =
  | "idle"
  | "loading"
  | "streaming"
  | "success"
  | "error";

export type InvestigationPhase =
  | "awaiting_input"
  | "ingesting_repository"
  | "mapping_architecture"
  | "running_agents"
  | "reconstructing_timeline"
  | "predicting_failures"
  | "synthesizing_verdict"
  | "complete"
  | "failed";

// ---------------------------------------------------------------------------
// AI Agents
// ---------------------------------------------------------------------------

export const AGENT_ROLES = [
  "ARCHITECT",
  "FORENSIC_ANALYST",
  "SECURITY_INVESTIGATOR",
  "FAILURE_PREDICTOR",
  "TIMELINE_RECONSTRUCTOR",
] as const;

export type AgentRole = (typeof AGENT_ROLES)[number];

export type AgentDisplayRole =
  | "ARCHITECT"
  | "FORENSIC ANALYST"
  | "SECURITY INVESTIGATOR"
  | "FAILURE PREDICTOR"
  | "TIMELINE RECONSTRUCTOR";

export type AgentStatus =
  | "idle"
  | "active"
  | "analyzing"
  | "warning"
  | "concurring"
  | "disputing"
  | "escalating"
  | "synthesized";

export type ApiAgentStatus =
  | "CONCURRING"
  | "DISPUTING"
  | "ESCALATING"
  | "SYNTHESIZED";

export type AgentSignalType =
  | "topology"
  | "evidence"
  | "security"
  | "prediction"
  | "timeline"
  | "verdict";

export interface AgentEvidence {
  id: EntityId;
  label: string;
  description?: string;
  source?: string;
  severity?: RiskSeverity;
  confidence?: ConfidenceScore;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export interface AgentMessage {
  id: EntityId;
  agentRole: AgentRole;
  message: string;
  timestamp: ISODateTimeString | TimestampLabel;
  signalType: AgentSignalType;
  status?: AgentStatus;
  confidence?: ConfidenceScore;
  evidenceIds?: EntityId[];
  metadata?: Record<string, unknown>;
}

export interface AgentData {
  id: EntityId;
  role: AgentRole;
  displayName: AgentDisplayRole;
  title: string;
  status: AgentStatus;
  confidence: ConfidenceScore;
  message: string;
  evidence: AgentEvidence[];
  messages?: AgentMessage[];
  currentTask?: string;
  disagreement?: string;
  lastUpdated?: ISODateTimeString;
  metadata?: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Timeline System
// ---------------------------------------------------------------------------

export interface TimelineForensicMetadata {
  agentRole?: AgentRole;
  source?: string;
  confidence?: ConfidenceScore;
  evidenceIds?: EntityId[];
  affectedServices?: string[];
  commitSha?: string;
  filePaths?: string[];
  tags?: string[];
}

export interface TimelineEvent {
  id: EntityId;
  title: string;
  timestamp: ISODateTimeString | TimestampLabel;
  severity: TimelineSeverity;
  description: string;
  metadata?: TimelineForensicMetadata;
}

// ---------------------------------------------------------------------------
// Risk System
// ---------------------------------------------------------------------------

export type RiskMetricKey =
  | "risk_score"
  | "stability_score"
  | "integrity_score"
  | "projected_failure_rate"
  | "security_exposure"
  | "dependency_volatility"
  | "scaling_pressure";

export interface RiskMetric {
  id: EntityId;
  key: RiskMetricKey;
  label: string;
  value: PercentageScore;
  severity: RiskSeverity;
  description?: string;
  trend?: "falling" | "stable" | "rising" | "spiking";
  evidenceIds?: EntityId[];
}

export interface RiskOverview {
  riskScore: PercentageScore;
  stabilityScore: PercentageScore;
  integrityScore: PercentageScore;
  projectedFailureRate: PercentageScore;
  severity: RiskSeverity;
  engineeringHealth: string;
  metrics: RiskMetric[];
  summary?: string;
  lastCalculatedAt?: ISODateTimeString;
}

// ---------------------------------------------------------------------------
// Architecture Analysis
// ---------------------------------------------------------------------------

export type ArchitectureNodeType =
  | "frontend"
  | "api"
  | "service"
  | "database"
  | "queue"
  | "auth"
  | "worker"
  | "external"
  | "unknown";

export type ArchitectureConnectionType =
  | "http"
  | "rpc"
  | "event"
  | "database"
  | "queue"
  | "auth"
  | "dependency"
  | "unknown";

export interface ArchitectureNode {
  id: EntityId;
  name: string;
  type: ArchitectureNodeType;
  service?: string;
  path?: string;
  severity?: RiskSeverity;
  healthScore?: PercentageScore;
  duplicated?: boolean;
  suspiciousPatterns?: string[];
  metadata?: Record<string, unknown>;
}

export interface ArchitectureConnection {
  id: EntityId;
  sourceId: EntityId;
  targetId: EntityId;
  type: ArchitectureConnectionType;
  label?: string;
  severity?: RiskSeverity;
  confidence?: ConfidenceScore;
  evidenceIds?: EntityId[];
  metadata?: Record<string, unknown>;
}

export interface ArchitectureReport {
  detectedServices: string[];
  nodes: ArchitectureNode[];
  connections: ArchitectureConnection[];
  dependencies: string[];
  duplicatedModules: string[];
  suspiciousPatterns: string[];
  architectureDrift: string[];
  frontendStructure?: string;
  backendStructure?: string;
  dependencyConcerns?: string[];
  summary?: string;
  metadata?: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Forensic Verdict
// ---------------------------------------------------------------------------

export interface Recommendation {
  id: EntityId;
  title: string;
  description: string;
  priority: "low" | "medium" | "high" | "urgent";
  ownerHint?: string;
  relatedRiskIds?: EntityId[];
}

export interface PredictedFailure {
  id: EntityId;
  title: string;
  probability: PercentageScore;
  severity: RiskSeverity | ApiSeverityLevel;
  description: string;
  trigger?: string;
  impactedServices?: string[];
  evidenceIds?: EntityId[];
}

export interface ForensicVerdict {
  severity: VerdictSeverity;
  verdict: string;
  rootCause: string;
  detectedRisks: string[];
  predictedFailures: PredictedFailure[];
  engineeringCollapseSummary: string;
  finalRecommendations: Recommendation[];
  futureRisks?: string[];
  scalingWarnings?: string[];
  architecturalVerdict?: string;
  confidence?: ConfidenceScore;
  generatedAt?: ISODateTimeString;
}

// ---------------------------------------------------------------------------
// API Request / Response Types
// ---------------------------------------------------------------------------

export type AnalysisProvider = "openai" | "gemini" | "mock";

export interface AnalyzeFileInput {
  path?: string;
  name?: string;
  content?: string;
  language?: string;
  sizeBytes?: number;
}

export interface AnalyzeRequest {
  repositoryUrl?: string;
  repoUrl?: string;
  url?: string;
  codeContent?: string;
  uploadedCode?: string;
  content?: string;
  mockProjectStructure?: unknown;
  projectStructure?: unknown;
  files?: AnalyzeFileInput[];
  provider?: AnalysisProvider;
  model?: string;
  metadata?: Record<string, unknown>;
}

export interface InvestigationSummary {
  projectOverview: string;
  detectedInstability: string;
  systemCondition: string;
  architecturalConcerns: string[];
}

export interface AnalyzeResponse {
  summary: InvestigationSummary;
  riskMetrics: RiskOverview;
  architectureReport: ArchitectureReport;
  timeline: TimelineEvent[];
  agents: AgentData[];
  verdict: ForensicVerdict;
  predictedFailures: PredictedFailure[];
  systemStatus?: SystemStatus;
  investigationPhase?: InvestigationPhase;
  requestId?: EntityId;
}

// Compatibility shape for the current API route while the UI migrates to the
// richer domain model above.
export interface LegacyRiskScore {
  overallRisk: PercentageScore;
  stabilityScore: PercentageScore;
  severityLevel: ApiSeverityLevel;
  engineeringHealth: string;
}

export interface LegacyArchitectureAnalysis {
  detectedServices: string[];
  frontendStructure: string;
  backendStructure: string;
  dependencyConcerns: string[];
  duplicatedModules: string[];
  suspiciousPatterns: string[];
}

export interface LegacyInvestigationAgent {
  role: AgentDisplayRole;
  confidence: ConfidenceScore;
  message: string;
  evidence: string[];
  status: ApiAgentStatus;
}

export interface LegacyVerdict {
  rootCause: string;
  engineeringCollapseExplanation: string;
  futureRisks: string[];
  scalingWarnings: string[];
  architecturalVerdict: string;
}

export interface LegacyPredictedFailure {
  title: string;
  probability: PercentageScore;
  severity: ApiSeverityLevel;
  description: string;
  trigger: string;
}

export interface LegacyAnalyzeResponse {
  summary: InvestigationSummary;
  riskScore: LegacyRiskScore;
  architecture: LegacyArchitectureAnalysis;
  timeline: Array<Omit<TimelineEvent, "id" | "metadata">>;
  agents: LegacyInvestigationAgent[];
  verdict: LegacyVerdict;
  predictedFailures: LegacyPredictedFailure[];
}

// ---------------------------------------------------------------------------
// UI Support Types
// ---------------------------------------------------------------------------

export interface InvestigationUiState {
  loadingState: LoadingState;
  systemStatus: SystemStatus;
  phase: InvestigationPhase;
  error?: string;
  activeAgentRole?: AgentRole;
  progress?: PercentageScore;
}

export interface StatusIndicator {
  label: string;
  status: SystemStatus;
  severity?: RiskSeverity;
  detail?: string;
}

export interface NavigationItem {
  id: EntityId;
  label: string;
  href: string;
  phase?: InvestigationPhase;
  disabled?: boolean;
}

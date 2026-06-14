import { mockAnalyzeResponse } from "@/lib/mockData";
import type {
  AgentData,
  AgentEvidence,
  AgentRole,
  ArchitectureReport,
  RiskOverview,
  RiskSeverity,
  TimelineEvent,
} from "@/types";

export type DisagreementLevel =
  | "low_disagreement"
  | "moderate_contradiction"
  | "severe_investigative_conflict"
  | "critical_forensic_disagreement";

export interface ContradictionInput {
  agents?: AgentData[];
  evidence?: AgentEvidence[];
  riskMetrics?: RiskOverview;
  architecture?: ArchitectureReport;
  timeline?: TimelineEvent[];
  forensicFindings?: string[];
  predictedFailures?: string[];
  suspiciousPatterns?: string[];
}

export interface AgentContradiction {
  id: string;
  challenger: AgentRole;
  target: AgentRole;
  speakingAgent: AgentRole;
  challengedAgent: AgentRole;
  topic: string;
  claim: string;
  counterClaim: string;
  disagreementReason: string;
  referencedEvidence: AgentEvidence[];
  evidenceIds: string[];
  severity: RiskSeverity;
  escalationLevel: DisagreementLevel;
  confidence: number;
}

export interface DebateTurn {
  id: string;
  speaker: AgentRole;
  target?: AgentRole;
  turnType:
    | "claim"
    | "interruption"
    | "challenge"
    | "evidence_escalation"
    | "synthesis";
  message: string;
  evidenceIds: string[];
  confidence: number;
  severity: RiskSeverity;
  timestamp: string;
}

export interface ChallengedFinding {
  id: string;
  finding: string;
  challengedBy: AgentRole;
  defendedBy: AgentRole;
  challenge: string;
  evidenceIds: string[];
  confidenceDelta: number;
  severity: RiskSeverity;
}

export interface EscalationMoment {
  id: string;
  triggeredBy: AgentRole;
  severity: RiskSeverity;
  moment: string;
  evidenceIds: string[];
  impact: string;
  confidence: number;
}

export interface DebateFlow {
  openingTheory: DebateTurn;
  interruptions: DebateTurn[];
  evidenceEscalations: DebateTurn[];
  synthesis: DebateTurn;
}

export interface ContradictionResult {
  contradictions: AgentContradiction[];
  debateFlow: DebateFlow;
  challengedFindings: ChallengedFinding[];
  escalationMoments: EscalationMoment[];
  confidence: number;
  generatedAt: string;
  usedFallback: boolean;
}

interface DebateContext {
  agents: AgentData[];
  evidence: AgentEvidence[];
  riskMetrics: RiskOverview;
  architecture?: ArchitectureReport;
  timeline: TimelineEvent[];
  findings: string[];
  riskSeverity: RiskSeverity;
}

export async function generateContradictions(
  agentsOrInput: AgentData[] | ContradictionInput = {},
  riskMetrics?: RiskOverview,
  evidence: AgentEvidence[] = [],
  architecture?: ArchitectureReport,
  timeline: TimelineEvent[] = [],
): Promise<ContradictionResult> {
  try {
    await Promise.resolve();
    const context = normalizeDebateContext(
      agentsOrInput,
      riskMetrics,
      evidence,
      architecture,
      timeline,
    );
    const contradictions = buildContradictions(context);
    const debateFlow = buildDebateFlow(context, contradictions);
    const challengedFindings = buildChallengedFindings(context, contradictions);
    const escalationMoments = buildEscalationMoments(context, contradictions);
    const confidence = clampScore(
      average([
        ...contradictions.map((item) => item.confidence),
        context.riskMetrics.riskScore,
      ]),
    );

    return {
      contradictions,
      debateFlow,
      challengedFindings,
      escalationMoments,
      confidence,
      generatedAt: now(),
      usedFallback: false,
    };
  } catch {
    return generateFallbackContradictions();
  }
}

export async function debate(
  agentsOrInput: AgentData[] | ContradictionInput = {},
  riskMetrics?: RiskOverview,
  evidence: AgentEvidence[] = [],
  architecture?: ArchitectureReport,
  timeline: TimelineEvent[] = [],
): Promise<ContradictionResult> {
  return generateContradictions(
    agentsOrInput,
    riskMetrics,
    evidence,
    architecture,
    timeline,
  );
}

export async function run(
  agentsOrInput: AgentData[] | ContradictionInput = {},
  riskMetrics?: RiskOverview,
  evidence: AgentEvidence[] = [],
  architecture?: ArchitectureReport,
  timeline: TimelineEvent[] = [],
): Promise<ContradictionResult> {
  return generateContradictions(
    agentsOrInput,
    riskMetrics,
    evidence,
    architecture,
    timeline,
  );
}

export function generateFallbackContradictions(): ContradictionResult {
  const agents = mockAnalyzeResponse.agents;
  const riskMetrics = mockAnalyzeResponse.riskMetrics;
  const evidence = agents.flatMap((agent) => agent.evidence).slice(0, 8);
  const context: DebateContext = {
    agents,
    evidence,
    riskMetrics,
    architecture: mockAnalyzeResponse.architectureReport,
    timeline: mockAnalyzeResponse.timeline,
    findings: [
      "Duplicated authentication authority is the initiating defect.",
      "Validation fragmentation escalates security exposure.",
      "Retry pressure can saturate infrastructure before topology repair completes.",
    ],
    riskSeverity: riskMetrics.severity,
  };
  const contradictions = buildContradictions(context);

  return {
    contradictions,
    debateFlow: buildDebateFlow(context, contradictions),
    challengedFindings: buildChallengedFindings(context, contradictions),
    escalationMoments: buildEscalationMoments(context, contradictions),
    confidence: 91,
    generatedAt: now(),
    usedFallback: true,
  };
}

function normalizeDebateContext(
  agentsOrInput: AgentData[] | ContradictionInput,
  riskMetrics?: RiskOverview,
  evidence: AgentEvidence[] = [],
  architecture?: ArchitectureReport,
  timeline: TimelineEvent[] = [],
): DebateContext {
  const input = Array.isArray(agentsOrInput)
    ? { agents: agentsOrInput, evidence, riskMetrics, architecture, timeline }
    : agentsOrInput;
  const normalizedRisk = input.riskMetrics ?? riskMetrics ?? mockAnalyzeResponse.riskMetrics;
  const normalizedAgents = normalizeAgents(input.agents);
  const normalizedEvidence = normalizeEvidence([
    ...(input.evidence ?? evidence),
    ...normalizedAgents.flatMap((agent) => agent.evidence),
  ]);
  const normalizedTimeline = input.timeline ?? timeline;
  const findings = uniqueCompact([
    ...(input.forensicFindings ?? []),
    ...(input.predictedFailures ?? []),
    ...(input.suspiciousPatterns ?? []),
    ...(input.architecture?.suspiciousPatterns ?? architecture?.suspiciousPatterns ?? []),
    ...(input.architecture?.architectureDrift ?? architecture?.architectureDrift ?? []),
    ...normalizedAgents.map((agent) => agent.message),
    ...normalizedTimeline.map((event) => `${event.title}: ${event.description}`),
  ]);

  return {
    agents: normalizedAgents,
    evidence: normalizedEvidence,
    riskMetrics: normalizedRisk,
    architecture: input.architecture ?? architecture,
    timeline: normalizedTimeline,
    findings,
    riskSeverity: normalizedRisk.severity,
  };
}

function buildContradictions(context: DebateContext): AgentContradiction[] {
  const contradictionBlueprints = [
    {
      challenger: "SECURITY_INVESTIGATOR" as AgentRole,
      target: "ARCHITECT" as AgentRole,
      topic: "Primary escalation vector",
      claim:
        "I disagree with topology-first containment. Validation bypass propagation is the primary escalation vector because trust decisions are already inconsistent across execution paths.",
      counterClaim:
        "The Architect maintains that fragmented service ownership is the origin point and security exposure is a downstream symptom.",
      reason:
        "Security evidence challenges whether architecture drift can be treated as non-adversarial while validation boundaries remain unproven.",
      evidenceHints: ["auth", "validation", "boundary", "session"],
      baseConfidence: 88,
    },
    {
      challenger: "FAILURE_PREDICTOR" as AgentRole,
      target: "FORENSIC_ANALYST" as AgentRole,
      topic: "Chronology versus probability",
      claim:
        "Both theories are incomplete. Dependency drift and retry amplification accelerate failure probability beyond authentication instability alone.",
      counterClaim:
        "The Forensic Analyst argues chronology matters: the first defect was introduced before runtime pressure began amplifying symptoms.",
      reason:
        "Predictive risk modeling disputes whether first cause should outrank next likely failure.",
      evidenceHints: ["dependency", "retry", "queue", "scaling", "deployment"],
      baseConfidence: 86,
    },
    {
      challenger: "ARCHITECT" as AgentRole,
      target: "FAILURE_PREDICTOR" as AgentRole,
      topic: "Remediation sequencing",
      claim:
        "Scaling guardrails are necessary, but they are not sufficient. Without restoring ownership boundaries, the same collapse path will reappear under a different symptom.",
      counterClaim:
        "The Failure Predictor argues runtime circuit breakers must ship first because the next outage can arrive before structural repair completes.",
      reason:
        "Architecture and prediction models disagree on whether strategic correction or tactical containment has priority.",
      evidenceHints: ["ownership", "drift", "service", "queue", "retry"],
      baseConfidence: 84,
    },
    {
      challenger: "TIMELINE_RECONSTRUCTOR" as AgentRole,
      target: "SECURITY_INVESTIGATOR" as AgentRole,
      topic: "Breach framing",
      claim:
        "Security exposure is real, but the timeline does not prove adversarial initiation. The causal chain begins with engineering drift, then becomes exploitable.",
      counterClaim:
        "The Security Investigator rejects waiting for adversarial proof; any inconsistent trust boundary is already an active exposure.",
      reason:
        "Timeline reconstruction challenges the language of the verdict while preserving the severity of the risk.",
      evidenceHints: ["timeline", "auth", "validation", "drift", "trust"],
      baseConfidence: 90,
    },
  ];
  const confidenceBoost = Math.round(context.riskMetrics.riskScore / 12);

  return contradictionBlueprints.map((blueprint, index) => {
    const referencedEvidence = selectEvidence(context.evidence, blueprint.evidenceHints);
    const severity = contradictionSeverity(context, index);

    return {
      id: createId("contradiction", `${blueprint.challenger}-${blueprint.target}-${index}`),
      challenger: blueprint.challenger,
      target: blueprint.target,
      speakingAgent: blueprint.challenger,
      challengedAgent: blueprint.target,
      topic: blueprint.topic,
      claim: tuneClaimWithAgentSignal(blueprint.claim, getAgentByRole(context, blueprint.challenger)),
      counterClaim: blueprint.counterClaim,
      disagreementReason: blueprint.reason,
      referencedEvidence,
      evidenceIds: referencedEvidence.map((item) => item.id),
      severity,
      escalationLevel: escalationLevelForSeverity(severity, context.riskMetrics.riskScore),
      confidence: clampScore(blueprint.baseConfidence + confidenceBoost - index * 2),
    };
  }).filter((contradiction) => {
    const agent = getAgentByRole(context, contradiction.challenger);

    return agent ? agent.confidence >= 40 : true;
  }).slice(0, 4);

}

function buildDebateFlow(
  context: DebateContext,
  contradictions: AgentContradiction[],
): DebateFlow {
  const openingAgent = getAgentByRole(context, "ARCHITECT") ?? context.agents[0];
  const synthesisAgent =
    getAgentByRole(context, "TIMELINE_RECONSTRUCTOR") ?? context.agents.at(-1);
  const firstEvidenceIds = context.evidence.slice(0, 3).map((item) => item.id);

  return {
    openingTheory: {
      id: "debate-opening-theory",
      speaker: openingAgent?.role ?? "ARCHITECT",
      turnType: "claim",
      message:
        openingAgent?.message ??
        "The instability originated from fragmented service ownership and moved outward through runtime pressure.",
      evidenceIds: firstEvidenceIds,
      confidence: openingAgent?.confidence ?? 82,
      severity: context.riskSeverity,
      timestamp: "T+00:09:14",
    },
    interruptions: contradictions.slice(0, 2).map((contradiction, index) => ({
      id: createId("debate-interruption", index),
      speaker: contradiction.challenger,
      target: contradiction.target,
      turnType: "interruption",
      message: contradiction.claim,
      evidenceIds: contradiction.evidenceIds,
      confidence: contradiction.confidence,
      severity: contradiction.severity,
      timestamp: `T+00:${String(12 + index * 3).padStart(2, "0")}:${String(
        22 + index * 9,
      ).padStart(2, "0")}`,
    })),
    evidenceEscalations: contradictions.slice(2).map((contradiction, index) => ({
      id: createId("debate-evidence-escalation", index),
      speaker: contradiction.challenger,
      target: contradiction.target,
      turnType: "evidence_escalation",
      message: `${contradiction.disagreementReason} Evidence packet elevated: ${formatEvidence(
        contradiction.referencedEvidence,
      )}.`,
      evidenceIds: contradiction.evidenceIds,
      confidence: contradiction.confidence,
      severity: contradiction.severity,
      timestamp: `T+00:${String(18 + index * 4).padStart(2, "0")}:${String(
        16 + index * 7,
      ).padStart(2, "0")}`,
    })),
    synthesis: {
      id: "debate-final-synthesis",
      speaker: synthesisAgent?.role ?? "TIMELINE_RECONSTRUCTOR",
      turnType: "synthesis",
      message:
        "Debate synthesis locked: the agents disagree on the first subsystem to fail, but converge on one collapse path: drift, duplicated authority, dependency volatility, and runtime amplification.",
      evidenceIds: context.evidence.slice(0, 5).map((item) => item.id),
      confidence: synthesisAgent?.confidence ?? 91,
      severity: context.riskSeverity,
      timestamp: "T+00:24:09",
    },
  };
}

function buildChallengedFindings(
  context: DebateContext,
  contradictions: AgentContradiction[],
): ChallengedFinding[] {
  const findings = ensureList(context.findings, [
    "Architecture drift is the primary root cause.",
    "Security exposure is downstream of engineering drift.",
    "Scaling pressure is an amplifier rather than an initiating defect.",
  ]);

  return contradictions.slice(0, 4).map((contradiction, index) => ({
    id: createId("challenged-finding", index),
    finding: findings[index % findings.length],
    challengedBy: contradiction.challenger,
    defendedBy: contradiction.target,
    challenge: contradiction.claim,
    evidenceIds: contradiction.evidenceIds,
    confidenceDelta: clampScore(
      Math.abs(contradiction.confidence - (getAgentByRole(context, contradiction.target)?.confidence ?? 75)),
    ),
    severity: contradiction.severity,
  }));
}

function buildEscalationMoments(
  context: DebateContext,
  contradictions: AgentContradiction[],
): EscalationMoment[] {
  return contradictions
    .filter((contradiction) => contradiction.severity === "critical" || contradiction.severity === "high")
    .map((contradiction, index) => ({
      id: createId("escalation", index),
      triggeredBy: contradiction.challenger,
      severity: contradiction.severity,
      moment:
        contradiction.severity === "critical"
          ? `${labelForAgent(contradiction.challenger)} interrupts the room and escalates the verdict toward mission-critical instability.`
          : `${labelForAgent(contradiction.challenger)} elevates the disagreement from interpretation to remediation priority.`,
      evidenceIds: contradiction.evidenceIds,
      impact: contradiction.disagreementReason,
      confidence: contradiction.confidence,
    }));
}

function normalizeAgents(agents?: AgentData[]): AgentData[] {
  if (agents && agents.length > 0) {
    return agents;
  }

  return mockAnalyzeResponse.agents;
}

function normalizeEvidence(evidence: AgentEvidence[]): AgentEvidence[] {
  const deduped = new Map<string, AgentEvidence>();

  for (const item of evidence) {
    if (item?.id) {
      deduped.set(item.id, item);
    }
  }

  const values = Array.from(deduped.values());

  if (values.length > 0) {
    return values;
  }

  return mockAnalyzeResponse.agents.flatMap((agent) => agent.evidence).slice(0, 8);
}

function selectEvidence(evidence: AgentEvidence[], hints: string[]) {
  const selected = evidence.filter((item) => {
    const text = `${item.label} ${item.description ?? ""} ${item.tags?.join(" ") ?? ""}`.toLowerCase();

    return hints.some((hint) => text.includes(hint));
  });

  return ensureList(selected, evidence).slice(0, 4);
}

function tuneClaimWithAgentSignal(claim: string, agent?: AgentData) {
  if (!agent?.currentTask) {
    return claim;
  }

  return `${claim} Current task signal: ${agent.currentTask}.`;
}

function contradictionSeverity(context: DebateContext, index: number): RiskSeverity {
  if (context.riskMetrics.severity === "critical") {
    return index === 0 || index === 1 ? "critical" : "high";
  }

  if (context.riskMetrics.severity === "high") {
    return index < 3 ? "high" : "medium";
  }

  if (context.riskMetrics.severity === "medium") {
    return index < 2 ? "medium" : "low";
  }

  return "low";
}

function escalationLevelForSeverity(
  severity: RiskSeverity,
  riskScore: number,
): DisagreementLevel {
  if (severity === "critical" || riskScore >= 88) {
    return "critical_forensic_disagreement";
  }

  if (severity === "high" || riskScore >= 72) {
    return "severe_investigative_conflict";
  }

  if (severity === "medium" || riskScore >= 45) {
    return "moderate_contradiction";
  }

  return "low_disagreement";
}

function getAgentByRole(context: DebateContext, role: AgentRole) {
  return context.agents.find((agent) => agent.role === role);
}

function labelForAgent(role: AgentRole) {
  return role.replaceAll("_", " ");
}

function formatEvidence(evidence: AgentEvidence[]) {
  if (evidence.length === 0) {
    return "NO-EVIDENCE-LINKED";
  }

  return evidence.map((item) => item.label).join(", ");
}

function ensureList<T>(values: T[], fallback: T[]) {
  return values.length > 0 ? values : fallback;
}

function uniqueCompact(values: string[]) {
  return Array.from(new Set(values.filter((value) => value.trim().length > 0)));
}

function average(values: number[]) {
  if (values.length === 0) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function clampScore(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(value)));
}

function createId(prefix: string, seed: string | number) {
  return `${prefix}-${String(seed)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72)}`;
}

function now() {
  return new Date().toISOString();
}

export const contradiction = {
  generateContradictions,
  debate,
  run,
  generateFallbackContradictions,
};

export default contradiction;

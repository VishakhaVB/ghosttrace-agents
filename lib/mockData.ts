import type {
  AgentData,
  AgentEvidence,
  AnalyzeResponse,
  ArchitectureReport,
  ForensicVerdict,
  InvestigationPhase,
  InvestigationSummary,
  PredictedFailure,
  Recommendation,
  RiskOverview,
  StatusIndicator,
  SystemStatus,
  TimelineEvent,
} from "@/types/index";

export type InvestigationPhaseStatus = {
  id: string;
  phase: InvestigationPhase;
  label: string;
  status: SystemStatus;
  progress: number;
  detail: string;
};

export const mockInvestigationSummary: InvestigationSummary = {
  projectOverview:
    "Ghost Trace ingested a multi-service SaaS repository with a Next.js console, API gateway, duplicated auth adapters, billing workers, PostgreSQL persistence, Redis queues, and external payment/webhook integrations.",
  detectedInstability:
    "The system is showing compound instability: authentication authority split across two modules, validation boundaries diverged after payment integration, and retry pressure is masking root-cause signals behind repeated downstream symptoms.",
  systemCondition:
    "Operationally degraded but recoverable. The architecture still has a coherent service spine, yet incident reconstruction indicates the next release train could convert contained drift into a SEV-1 outage.",
  architecturalConcerns: [
    "Session validation is duplicated between edge middleware, API handlers, and worker replay logic.",
    "Billing retries can re-enter the queue without an idempotency verdict from the original request path.",
    "Dependency upgrades are pinned in the frontend but floating in worker packages, creating runtime parity risk.",
    "The event bus now carries cross-domain recovery decisions that should belong to service-owned adapters.",
  ],
};

export const mockAgentEvidence: Record<
  | "authDuplication"
  | "validationFragment"
  | "dependencyDrift"
  | "scalingPressure"
  | "topologyDrift",
  AgentEvidence
> = {
  authDuplication: {
    id: "evidence-auth-duplication",
    label: "AUTH-17 duplicated authority",
    description:
      "Two independent auth adapters can mint or validate session state without a shared revocation source.",
    source: "apps/api/auth/session.ts -> workers/replay/authFallback.ts",
    severity: "critical",
    confidence: 94,
    tags: ["auth", "duplication", "session-drift"],
  },
  validationFragment: {
    id: "evidence-validation-fragment",
    label: "VAL-42 boundary fragmentation",
    description:
      "Validation rules diverge between public API ingress, queue consumers, and payment webhook normalization.",
    source: "api/routes/*, workers/billing-consumer.ts",
    severity: "high",
    confidence: 91,
    tags: ["validation", "api", "queues"],
  },
  dependencyDrift: {
    id: "evidence-dependency-drift",
    label: "DEP-09 dependency drift",
    description:
      "Worker services resolve a different transitive parser and retry package than the web/API build.",
    source: "package-lock.json, workers/package.json",
    severity: "high",
    confidence: 87,
    tags: ["dependencies", "runtime-parity", "workers"],
  },
  scalingPressure: {
    id: "evidence-scaling-pressure",
    label: "SIM-28 scaling pressure",
    description:
      "Load replay predicts queue saturation once failed billing events exceed a 3.6% retry threshold.",
    source: "synthetic-load-replay://peak-release-window",
    severity: "critical",
    confidence: 89,
    tags: ["scaling", "queue", "prediction"],
  },
  topologyDrift: {
    id: "evidence-topology-drift",
    label: "TOPO-61 architecture drift",
    description:
      "Runtime call graph no longer matches intended domain ownership for auth, billing, and notification flows.",
    source: "trace-map://service-callgraph",
    severity: "critical",
    confidence: 92,
    tags: ["architecture", "ownership", "callgraph"],
  },
};

export const mockAgents: AgentData[] = [
  {
    id: "agent-architect",
    role: "ARCHITECT",
    displayName: "ARCHITECT",
    title: "System topology arbitrator",
    status: "active",
    confidence: 94,
    message:
      "Authentication drift propagated across duplicated validation layers after payment integration. I classify this as architecture drift first, operational overload second.",
    evidence: [
      mockAgentEvidence.topologyDrift,
      mockAgentEvidence.authDuplication,
      mockAgentEvidence.validationFragment,
    ],
    currentTask: "Mapping ownership boundaries against runtime call graph",
    disagreement:
      "Disagrees with the Failure Predictor: queue saturation is a downstream amplifier, not the initiating defect.",
    lastUpdated: "2026-06-14T10:34:12.000Z",
    messages: [
      {
        id: "msg-architect-01",
        agentRole: "ARCHITECT",
        message:
          "Service topology is recoverable, but adapter authority is split across three execution contexts.",
        timestamp: "T+00:07:18",
        signalType: "topology",
        status: "active",
        confidence: 94,
        evidenceIds: ["evidence-topology-drift", "evidence-auth-duplication"],
      },
    ],
    metadata: {
      stance: "root-cause-first",
      signal: "TOPOLOGY_LOCK",
    },
  },
  {
    id: "agent-forensic-analyst",
    role: "FORENSIC_ANALYST",
    displayName: "FORENSIC ANALYST",
    title: "Root-cause evidence engine",
    status: "concurring",
    confidence: 92,
    message:
      "Commit chronology confirms the instability began when billing webhook normalization bypassed the canonical validator and introduced a parallel request shape.",
    evidence: [
      mockAgentEvidence.validationFragment,
      mockAgentEvidence.dependencyDrift,
      mockAgentEvidence.topologyDrift,
    ],
    currentTask: "Correlating commits, traces, and dependency resolution changes",
    disagreement:
      "Challenges the Security Investigator's breach-first framing; evidence shows exposure was created by engineering drift, not adversarial traffic.",
    lastUpdated: "2026-06-14T10:35:39.000Z",
    messages: [
      {
        id: "msg-forensic-01",
        agentRole: "FORENSIC_ANALYST",
        message:
          "The regression signature aligns with webhook adapter expansion and a silent worker dependency resolution shift.",
        timestamp: "T+00:11:42",
        signalType: "evidence",
        status: "concurring",
        confidence: 92,
        evidenceIds: ["evidence-validation-fragment", "evidence-dependency-drift"],
      },
    ],
    metadata: {
      stance: "evidence-correlation",
      signal: "COMMIT_TRACE_SYNC",
    },
  },
  {
    id: "agent-security-investigator",
    role: "SECURITY_INVESTIGATOR",
    displayName: "SECURITY INVESTIGATOR",
    title: "Threat boundary examiner",
    status: "disputing",
    confidence: 88,
    message:
      "I dispute the idea that this is contained architecture drift. Internal ingress can bypass validation and produce inconsistent authorization verdicts under replay.",
    evidence: [
      mockAgentEvidence.authDuplication,
      mockAgentEvidence.validationFragment,
      mockAgentEvidence.topologyDrift,
    ],
    currentTask: "Testing privilege assumptions across API ingress and queue replay",
    disagreement:
      "Disputes the Architect's containment rating because replayed billing events can cross trust boundaries.",
    lastUpdated: "2026-06-14T10:36:08.000Z",
    messages: [
      {
        id: "msg-security-01",
        agentRole: "SECURITY_INVESTIGATOR",
        message:
          "Authorization verdict is not deterministic when queue replay enters through the fallback adapter.",
        timestamp: "T+00:14:06",
        signalType: "security",
        status: "disputing",
        confidence: 88,
        evidenceIds: ["evidence-auth-duplication", "evidence-validation-fragment"],
      },
    ],
    metadata: {
      stance: "trust-boundary",
      signal: "BOUNDARY_ALERT",
    },
  },
  {
    id: "agent-failure-predictor",
    role: "FAILURE_PREDICTOR",
    displayName: "FAILURE PREDICTOR",
    title: "Collapse simulation model",
    status: "escalating",
    confidence: 90,
    message:
      "A three-node latency spike can trigger enough billing retries to exhaust workers in eleven minutes. The initiating defect matters less once retry pressure crosses threshold.",
    evidence: [
      mockAgentEvidence.scalingPressure,
      mockAgentEvidence.dependencyDrift,
      mockAgentEvidence.validationFragment,
    ],
    currentTask: "Projecting release-window failure modes under peak traffic",
    disagreement:
      "Disagrees with the Architect on priority: scaling guardrails must ship before the deeper topology repair finishes.",
    lastUpdated: "2026-06-14T10:37:44.000Z",
    messages: [
      {
        id: "msg-failure-01",
        agentRole: "FAILURE_PREDICTOR",
        message:
          "Retry pressure breaches queue tolerance at 3.6% failure density; worker saturation follows within one release window.",
        timestamp: "T+00:18:33",
        signalType: "prediction",
        status: "escalating",
        confidence: 90,
        evidenceIds: ["evidence-scaling-pressure", "evidence-dependency-drift"],
      },
    ],
    metadata: {
      stance: "future-risk",
      signal: "COLLAPSE_SIM_ACTIVE",
    },
  },
  {
    id: "agent-timeline-reconstructor",
    role: "TIMELINE_RECONSTRUCTOR",
    displayName: "TIMELINE RECONSTRUCTOR",
    title: "Incident chronology synthesizer",
    status: "synthesized",
    confidence: 97,
    message:
      "The collapse path is chronological, not random: validation split, auth duplication, dependency drift, retry amplification, and finally observability collapse.",
    evidence: [
      mockAgentEvidence.validationFragment,
      mockAgentEvidence.authDuplication,
      mockAgentEvidence.scalingPressure,
      mockAgentEvidence.topologyDrift,
    ],
    currentTask: "Locking final incident sequence for verdict synthesis",
    disagreement:
      "Synthesizes the dispute: security exposure and scaling degradation are both consequences of the same architectural fracture.",
    lastUpdated: "2026-06-14T10:38:55.000Z",
    messages: [
      {
        id: "msg-timeline-01",
        agentRole: "TIMELINE_RECONSTRUCTOR",
        message:
          "Sequence confirmed: validator split, auth duplication, dependency mismatch, queue pressure, error propagation.",
        timestamp: "T+00:22:19",
        signalType: "timeline",
        status: "synthesized",
        confidence: 97,
        evidenceIds: [
          "evidence-validation-fragment",
          "evidence-auth-duplication",
          "evidence-scaling-pressure",
        ],
      },
    ],
    metadata: {
      stance: "causal-chain",
      signal: "TRACE_STITCH_LOCKED",
    },
  },
];

export const mockTimelineEvents: TimelineEvent[] = [
  {
    id: "timeline-validation-fragmented",
    timestamp: "T+00:03:12",
    severity: "high",
    title: "Validation boundary fragmented",
    description:
      "Payment webhook normalization introduced a second request shape, allowing API handlers and queue consumers to interpret the same event with different trust assumptions.",
    metadata: {
      agentRole: "FORENSIC_ANALYST",
      source: "commit:7f41b9a",
      confidence: 91,
      evidenceIds: ["evidence-validation-fragment"],
      affectedServices: ["api-gateway", "billing-worker", "payment-webhook"],
      commitSha: "7f41b9a",
      filePaths: ["apps/api/routes/webhooks.ts", "workers/billing-consumer.ts"],
      tags: ["validation", "webhook", "request-shape"],
    },
  },
  {
    id: "timeline-auth-duplication",
    timestamp: "T+00:08:44",
    severity: "critical",
    title: "Authentication duplication introduced",
    description:
      "A fallback replay adapter began validating sessions independently from the edge middleware, splitting revocation logic between live traffic and asynchronous recovery paths.",
    metadata: {
      agentRole: "SECURITY_INVESTIGATOR",
      source: "trace:auth-session-drift",
      confidence: 94,
      evidenceIds: ["evidence-auth-duplication"],
      affectedServices: ["edge-auth", "api-gateway", "billing-worker"],
      commitSha: "bb31d72",
      filePaths: ["middleware.ts", "workers/replay/authFallback.ts"],
      tags: ["auth", "session", "replay"],
    },
  },
  {
    id: "timeline-dependency-instability",
    timestamp: "T+00:12:06",
    severity: "high",
    title: "Dependency instability escalated",
    description:
      "Worker packages resolved a different transitive parser and retry library than the web/API runtime, creating inconsistent error handling during replay.",
    metadata: {
      agentRole: "FORENSIC_ANALYST",
      source: "lockfile-diff:release-4.8",
      confidence: 87,
      evidenceIds: ["evidence-dependency-drift"],
      affectedServices: ["billing-worker", "notification-worker", "api-gateway"],
      filePaths: ["package-lock.json", "workers/package.json"],
      tags: ["dependencies", "runtime-parity", "retry"],
    },
  },
  {
    id: "timeline-architecture-drift",
    timestamp: "T+00:17:29",
    severity: "critical",
    title: "Architecture drift crossed service ownership",
    description:
      "Recovery logic moved from service-owned adapters into the event bus, letting billing, notifications, and auth mutate shared state from competing control planes.",
    metadata: {
      agentRole: "ARCHITECT",
      source: "runtime-callgraph:topology-replay",
      confidence: 92,
      evidenceIds: ["evidence-topology-drift"],
      affectedServices: ["event-bus", "billing-api", "notification-worker", "auth-service"],
      tags: ["architecture", "ownership", "event-bus"],
    },
  },
  {
    id: "timeline-scaling-degradation",
    timestamp: "T+00:22:51",
    severity: "high",
    title: "Scaling degradation projected",
    description:
      "Synthetic release-window replay showed retry density exceeding queue tolerance, with worker exhaustion projected before autoscaling could stabilize throughput.",
    metadata: {
      agentRole: "FAILURE_PREDICTOR",
      source: "simulation:peak-release-window",
      confidence: 89,
      evidenceIds: ["evidence-scaling-pressure"],
      affectedServices: ["redis-queue", "billing-worker", "api-gateway"],
      tags: ["scaling", "queue", "autoscaling"],
    },
  },
  {
    id: "timeline-error-propagation",
    timestamp: "T+00:29:18",
    severity: "critical",
    title: "Error propagation increased",
    description:
      "Errors began repeating across adapters as symptoms instead of root causes, collapsing observability into noisy retries and obscuring the first failing boundary.",
    metadata: {
      agentRole: "TIMELINE_RECONSTRUCTOR",
      source: "trace-correlation:error-cascade",
      confidence: 96,
      evidenceIds: [
        "evidence-validation-fragment",
        "evidence-auth-duplication",
        "evidence-scaling-pressure",
      ],
      affectedServices: ["observability", "api-gateway", "workers", "event-bus"],
      tags: ["error-propagation", "observability", "incident-replay"],
    },
  },
];

export const mockRiskMetrics: RiskOverview = {
  riskScore: 87,
  stabilityScore: 42,
  integrityScore: 61,
  projectedFailureRate: 73,
  severity: "critical",
  engineeringHealth: "Critical systemic exposure detected",
  summary:
    "The system is not failing from one defect; it is degrading through coupled architecture drift, inconsistent trust boundaries, and retry amplification.",
  lastCalculatedAt: "2026-06-14T10:39:30.000Z",
  metrics: [
    {
      id: "risk-overall",
      key: "risk_score",
      label: "Risk Score",
      value: 87,
      severity: "critical",
      description:
        "Compound failure pressure is high enough to justify immediate release gating.",
      trend: "spiking",
      evidenceIds: ["evidence-topology-drift", "evidence-scaling-pressure"],
    },
    {
      id: "risk-stability",
      key: "stability_score",
      label: "Stability Index",
      value: 42,
      severity: "high",
      description:
        "Runtime resilience is below mission threshold because validation, auth, and retry behavior disagree across services.",
      trend: "falling",
      evidenceIds: ["evidence-validation-fragment", "evidence-auth-duplication"],
    },
    {
      id: "risk-integrity",
      key: "integrity_score",
      label: "Architecture Integrity",
      value: 61,
      severity: "high",
      description:
        "Service ownership is still legible, but recovery paths have crossed domain boundaries.",
      trend: "falling",
      evidenceIds: ["evidence-topology-drift"],
    },
    {
      id: "risk-failure-rate",
      key: "projected_failure_rate",
      label: "Failure Probability",
      value: 73,
      severity: "high",
      description:
        "Predicted release-window failure probability under peak billing traffic and replay pressure.",
      trend: "rising",
      evidenceIds: ["evidence-scaling-pressure"],
    },
    {
      id: "risk-security-exposure",
      key: "security_exposure",
      label: "Security Exposure",
      value: 69,
      severity: "high",
      description:
        "Replay authorization can diverge from live traffic authorization, expanding internal trust exposure.",
      trend: "rising",
      evidenceIds: ["evidence-auth-duplication", "evidence-validation-fragment"],
    },
    {
      id: "risk-dependency-volatility",
      key: "dependency_volatility",
      label: "Dependency Volatility",
      value: 76,
      severity: "high",
      description:
        "Worker and API runtimes no longer share deterministic dependency behavior.",
      trend: "spiking",
      evidenceIds: ["evidence-dependency-drift"],
    },
    {
      id: "risk-scaling-pressure",
      key: "scaling_pressure",
      label: "Scaling Pressure",
      value: 81,
      severity: "critical",
      description:
        "Queue replay can saturate faster than autoscaling can restore safe throughput.",
      trend: "spiking",
      evidenceIds: ["evidence-scaling-pressure"],
    },
  ],
};

export const mockArchitectureReport: ArchitectureReport = {
  detectedServices: [
    "web-console",
    "api-gateway",
    "edge-auth",
    "auth-service",
    "billing-api",
    "billing-worker",
    "notification-worker",
    "event-bus",
    "postgres-core",
    "redis-queue",
    "stripe-webhook-adapter",
    "observability-pipeline",
  ],
  nodes: [
    {
      id: "node-web-console",
      name: "Web Console",
      type: "frontend",
      service: "web-console",
      path: "apps/web",
      severity: "medium",
      healthScore: 72,
      suspiciousPatterns: ["client-side retry assumptions", "duplicated API response guards"],
    },
    {
      id: "node-api-gateway",
      name: "API Gateway",
      type: "api",
      service: "api-gateway",
      path: "apps/api",
      severity: "high",
      healthScore: 58,
      suspiciousPatterns: ["fragmented validation", "mixed auth middleware"],
    },
    {
      id: "node-edge-auth",
      name: "Edge Auth",
      type: "auth",
      service: "edge-auth",
      path: "middleware.ts",
      severity: "critical",
      healthScore: 46,
      duplicated: true,
      suspiciousPatterns: ["split session authority", "revocation mismatch"],
    },
    {
      id: "node-auth-service",
      name: "Auth Service",
      type: "service",
      service: "auth-service",
      path: "services/auth",
      severity: "critical",
      healthScore: 49,
      duplicated: true,
      suspiciousPatterns: ["parallel token validation", "fallback replay authority"],
    },
    {
      id: "node-billing-worker",
      name: "Billing Worker",
      type: "worker",
      service: "billing-worker",
      path: "workers/billing",
      severity: "critical",
      healthScore: 38,
      suspiciousPatterns: ["retry amplification", "non-deterministic parser dependency"],
    },
    {
      id: "node-event-bus",
      name: "Event Bus",
      type: "queue",
      service: "event-bus",
      path: "infrastructure/events",
      severity: "high",
      healthScore: 55,
      suspiciousPatterns: ["cross-domain recovery decisions", "dead-letter replay ambiguity"],
    },
    {
      id: "node-postgres",
      name: "Postgres Core",
      type: "database",
      service: "postgres-core",
      severity: "medium",
      healthScore: 74,
      suspiciousPatterns: ["shared state mutation from workers and API"],
    },
    {
      id: "node-stripe",
      name: "Stripe Adapter",
      type: "external",
      service: "stripe-webhook-adapter",
      path: "integrations/stripe",
      severity: "high",
      healthScore: 57,
      suspiciousPatterns: ["webhook normalization bypass", "idempotency drift"],
    },
  ],
  connections: [
    {
      id: "conn-web-api",
      sourceId: "node-web-console",
      targetId: "node-api-gateway",
      type: "http",
      label: "client API calls",
      severity: "medium",
      confidence: 86,
    },
    {
      id: "conn-api-auth",
      sourceId: "node-api-gateway",
      targetId: "node-edge-auth",
      type: "auth",
      label: "session validation",
      severity: "critical",
      confidence: 94,
      evidenceIds: ["evidence-auth-duplication"],
    },
    {
      id: "conn-api-event-bus",
      sourceId: "node-api-gateway",
      targetId: "node-event-bus",
      type: "event",
      label: "billing event publish",
      severity: "high",
      confidence: 89,
      evidenceIds: ["evidence-validation-fragment"],
    },
    {
      id: "conn-event-worker",
      sourceId: "node-event-bus",
      targetId: "node-billing-worker",
      type: "queue",
      label: "retry replay",
      severity: "critical",
      confidence: 91,
      evidenceIds: ["evidence-scaling-pressure"],
    },
    {
      id: "conn-worker-auth",
      sourceId: "node-billing-worker",
      targetId: "node-auth-service",
      type: "auth",
      label: "fallback authorization",
      severity: "critical",
      confidence: 88,
      evidenceIds: ["evidence-auth-duplication"],
    },
    {
      id: "conn-worker-db",
      sourceId: "node-billing-worker",
      targetId: "node-postgres",
      type: "database",
      label: "payment state mutation",
      severity: "high",
      confidence: 84,
    },
    {
      id: "conn-stripe-api",
      sourceId: "node-stripe",
      targetId: "node-api-gateway",
      type: "http",
      label: "webhook ingress",
      severity: "high",
      confidence: 87,
      evidenceIds: ["evidence-validation-fragment"],
    },
  ],
  dependencies: [
    "next@16.2.9",
    "react@19.2.4",
    "framer-motion@12.40.0",
    "zod@floating-worker-resolution",
    "bullmq@worker-only",
    "stripe@webhook-adapter",
    "jsonwebtoken@legacy-auth-path",
    "jose@edge-auth-path",
    "pg@database-core",
    "ioredis@queue-runtime",
  ],
  duplicatedModules: [
    "auth/sessionValidator.ts",
    "auth/replaySessionFallback.ts",
    "validators/paymentIntentSchema.ts",
    "validators/webhookPayloadSchema.ts",
    "retry/billingRetryPolicy.ts",
    "retry/deadLetterReplayPolicy.ts",
  ],
  suspiciousPatterns: [
    "Auth systems use both jose and jsonwebtoken across different execution paths.",
    "Webhook payload validation is stricter in live API traffic than in replayed queue events.",
    "Billing worker retry policy can republish events without a single idempotency authority.",
    "Notification worker depends on billing event shape but owns no schema contract.",
    "Observability pipeline receives repeated downstream errors without preserving first-failure causality.",
  ],
  architectureDrift: [
    "Recovery logic escaped service adapters and moved into event bus consumers.",
    "Auth authority is split between edge middleware and worker fallback logic.",
    "Frontend optimistic state assumes API errors are user-correctable, while backend traces show infrastructure retries.",
    "Database writes are shared between synchronous API handlers and asynchronous replay workers.",
  ],
  frontendStructure:
    "Next.js mission-control interface with repository upload, forensic timeline, risk meter, agent council, and final verdict panels.",
  backendStructure:
    "API gateway, auth middleware, billing service, webhook adapter, Redis-backed queue workers, PostgreSQL persistence, and observability ingestion pipeline.",
  dependencyConcerns: [
    "Worker runtime resolves parser and retry dependencies differently from the API runtime.",
    "Auth stack is split between edge-compatible jose and legacy jsonwebtoken validation.",
    "Queue package is isolated from the app lock discipline, raising release parity risk.",
    "Webhook adapter dependencies introduce normalization behavior not mirrored by internal event consumers.",
  ],
  summary:
    "The architecture is coherent enough to recover, but several control planes now make overlapping decisions about identity, validation, retries, and state mutation.",
  metadata: {
    suspiciousDependencies: [
      "jsonwebtoken",
      "jose",
      "bullmq",
      "stripe",
      "ioredis",
    ],
    unstableIntegrations: [
      "Stripe webhooks",
      "Redis replay queue",
      "Legacy auth fallback",
      "Notification fanout",
      "Observability correlation sink",
    ],
    authSystems: ["edge-auth", "auth-service", "worker-replay-auth"],
    databases: ["postgres-core"],
    messagingSystems: ["redis-queue", "event-bus", "dead-letter-replay"],
  },
};

export const mockPredictedFailures: PredictedFailure[] = [
  {
    id: "failure-scaling-instability",
    title: "Scaling instability under release-window traffic",
    probability: 84,
    severity: "CRITICAL",
    description:
      "Queue replay volume can outpace worker recovery and generate a saturation loop before autoscaling catches the first pressure spike.",
    trigger: "Peak billing traffic plus retry density above 3.6%",
    impactedServices: ["billing-worker", "redis-queue", "api-gateway"],
    evidenceIds: ["evidence-scaling-pressure"],
  },
  {
    id: "failure-auth-inconsistency",
    title: "Authentication inconsistency during replay",
    probability: 79,
    severity: "HIGH",
    description:
      "Live requests and replayed worker jobs can disagree on session validity, producing inconsistent authorization and delayed revocation enforcement.",
    trigger: "Fallback auth adapter validates a revoked or stale replay token",
    impactedServices: ["edge-auth", "auth-service", "billing-worker"],
    evidenceIds: ["evidence-auth-duplication"],
  },
  {
    id: "failure-cascading-workers",
    title: "Cascading worker failure propagation",
    probability: 76,
    severity: "HIGH",
    description:
      "Repeated billing failures can cascade into notification fanout and dead-letter replay, multiplying symptoms across systems that do not share a causal trace.",
    trigger: "Billing event replay enters notification fanout without canonical failure envelope",
    impactedServices: ["billing-worker", "notification-worker", "event-bus"],
    evidenceIds: ["evidence-validation-fragment", "evidence-scaling-pressure"],
  },
  {
    id: "failure-deployment-instability",
    title: "Deployment instability from dependency drift",
    probability: 71,
    severity: "HIGH",
    description:
      "A deployment that updates worker dependencies without matching API runtime behavior can change parsing, retries, or error classification in production.",
    trigger: "Worker package resolution diverges from application lockfile during release",
    impactedServices: ["billing-worker", "notification-worker", "api-gateway"],
    evidenceIds: ["evidence-dependency-drift"],
  },
  {
    id: "failure-security-exposure",
    title: "Internal security exposure through trust boundary bypass",
    probability: 68,
    severity: "HIGH",
    description:
      "Internal replay routes can bypass the strictest validation path, expanding exposure if malformed events enter the queue from webhook ingress.",
    trigger: "Malformed payment event survives webhook normalization and enters replay",
    impactedServices: ["api-gateway", "event-bus", "auth-service"],
    evidenceIds: ["evidence-auth-duplication", "evidence-validation-fragment"],
  },
  {
    id: "failure-api-degradation",
    title: "API degradation from retry-amplified latency",
    probability: 74,
    severity: "HIGH",
    description:
      "Synchronous API handlers can experience elevated latency when downstream retry storms increase database contention and observability noise.",
    trigger: "Retry storm coincides with synchronous payment status checks",
    impactedServices: ["api-gateway", "postgres-core", "observability-pipeline"],
    evidenceIds: ["evidence-scaling-pressure", "evidence-topology-drift"],
  },
];

export const mockRecommendations: Recommendation[] = [
  {
    id: "rec-freeze-release",
    title: "Gate the next release train",
    description:
      "Freeze production release until auth authority, webhook validation, and replay idempotency share one enforced contract.",
    priority: "urgent",
    ownerHint: "Engineering leadership",
    relatedRiskIds: ["risk-overall", "risk-scaling-pressure"],
  },
  {
    id: "rec-unify-auth",
    title: "Collapse duplicated authentication authority",
    description:
      "Move replay authorization behind the canonical auth service and remove independent worker token validation.",
    priority: "urgent",
    ownerHint: "Security platform",
    relatedRiskIds: ["risk-security-exposure", "risk-stability"],
  },
  {
    id: "rec-contract-validation",
    title: "Install shared validation contracts",
    description:
      "Generate one schema contract for API ingress, webhook normalization, queue consumers, and replay handlers.",
    priority: "high",
    ownerHint: "API platform",
    relatedRiskIds: ["risk-stability", "risk-integrity"],
  },
  {
    id: "rec-retry-circuit-breaker",
    title: "Add retry circuit breakers and idempotency verdicts",
    description:
      "Block unbounded replay, attach first-failure causality, and require idempotency confirmation before republishing billing events.",
    priority: "high",
    ownerHint: "Runtime reliability",
    relatedRiskIds: ["risk-scaling-pressure", "risk-failure-rate"],
  },
  {
    id: "rec-runtime-parity",
    title: "Enforce dependency parity across runtimes",
    description:
      "Unify lockfile governance for web, API, and worker packages, then add release checks for parser and retry library drift.",
    priority: "high",
    ownerHint: "Developer infrastructure",
    relatedRiskIds: ["risk-dependency-volatility"],
  },
];

export const mockFinalVerdict: ForensicVerdict = {
  severity: "critical",
  verdict:
    "GHOST TRACE VERDICT: SEV-1 systemic instability likely without intervention. The system is recoverable, but only if release velocity pauses long enough to restore a single source of truth for auth, validation, retries, and ownership boundaries.",
  rootCause:
    "A payment integration expanded faster than the architecture contract. Validation fragmented first, duplicated authentication authority followed, dependency drift changed worker behavior, and retry amplification converted localized defects into system-wide collapse pressure.",
  detectedRisks: [
    "Duplicated authentication authority between edge middleware and replay workers.",
    "Fragmented validation across API ingress, webhook normalization, and queue consumers.",
    "Dependency drift between API and worker runtimes.",
    "Retry amplification capable of saturating Redis-backed billing workers.",
    "Architecture drift crossing ownership boundaries for auth, billing, and notification flows.",
    "Observability collapse caused by repeated downstream symptoms masking first failure.",
  ],
  predictedFailures: mockPredictedFailures,
  engineeringCollapseSummary:
    "The collapse is not random and not purely a scaling event. It is an engineered chain reaction: schema drift created ambiguous events, duplicated auth allowed inconsistent trust decisions, dependency drift changed recovery behavior, and queue retries amplified the blast radius until the original fault became hard to see.",
  finalRecommendations: mockRecommendations,
  futureRisks: [
    "Release-window traffic may convert retry pressure into worker exhaustion.",
    "Replay authorization can remain inconsistent after token revocation.",
    "Deployment parity gaps may reintroduce fixed bugs through worker-only dependency shifts.",
    "Security exposure will increase if malformed webhook events survive into internal queues.",
    "Incident response time will degrade if observability continues reporting symptoms without first-failure lineage.",
  ],
  scalingWarnings: [
    "Autoscaling will not compensate for unbounded replay if retries multiply faster than worker capacity.",
    "Database contention is projected once synchronous payment reads collide with replay writes.",
    "Queue dead-letter replay requires a circuit breaker before peak traffic simulation is considered safe.",
  ],
  architecturalVerdict:
    "The architecture needs a control-plane correction: restore canonical ownership for auth, validation, idempotency, and replay before adding new feature surface.",
  confidence: 93,
  generatedAt: "2026-06-14T10:40:00.000Z",
};

export const mockSystemStatus: StatusIndicator[] = [
  {
    label: "AI system status",
    status: "investigating",
    severity: "high",
    detail: "Five-agent council active; evidence graph synchronized.",
  },
  {
    label: "Forensic engine state",
    status: "online",
    severity: "medium",
    detail: "Repository topology, dependency drift, and trace chronology loaded.",
  },
  {
    label: "Active scan indicators",
    status: "warning",
    severity: "high",
    detail: "Auth fragmentation, dependency volatility, and queue saturation indicators detected.",
  },
  {
    label: "Verdict synthesis",
    status: "critical",
    severity: "critical",
    detail: "Cross-agent quorum reached; release gate recommendation active.",
  },
];

export const mockInvestigationPhases: InvestigationPhaseStatus[] = [
  {
    id: "phase-awaiting-input",
    phase: "awaiting_input",
    label: "Repository evidence accepted",
    status: "online",
    progress: 100,
    detail: "Source package fingerprinted and staged for analysis.",
  },
  {
    id: "phase-ingesting",
    phase: "ingesting_repository",
    label: "Repository ingestion",
    status: "online",
    progress: 100,
    detail: "Service topology and dependency manifests indexed.",
  },
  {
    id: "phase-architecture",
    phase: "mapping_architecture",
    label: "Architecture mapping",
    status: "warning",
    progress: 92,
    detail: "Runtime call graph diverges from intended ownership map.",
  },
  {
    id: "phase-agents",
    phase: "running_agents",
    label: "AI agent council",
    status: "investigating",
    progress: 88,
    detail: "Agent disagreement detected and preserved for verdict synthesis.",
  },
  {
    id: "phase-timeline",
    phase: "reconstructing_timeline",
    label: "Timeline reconstruction",
    status: "online",
    progress: 96,
    detail: "Collapse sequence locked with high-confidence evidence links.",
  },
  {
    id: "phase-prediction",
    phase: "predicting_failures",
    label: "Failure prediction",
    status: "critical",
    progress: 84,
    detail: "Scaling and auth inconsistency failures projected for next release window.",
  },
  {
    id: "phase-verdict",
    phase: "synthesizing_verdict",
    label: "Final verdict synthesis",
    status: "critical",
    progress: 93,
    detail: "SEV-1 risk verdict generated with release gate recommendation.",
  },
];

export const mockAnalyzeResponse: AnalyzeResponse = {
  summary: mockInvestigationSummary,
  riskMetrics: mockRiskMetrics,
  architectureReport: mockArchitectureReport,
  timeline: mockTimelineEvents,
  agents: mockAgents,
  verdict: mockFinalVerdict,
  predictedFailures: mockPredictedFailures,
  systemStatus: "critical",
  investigationPhase: "synthesizing_verdict",
  requestId: "mock-investigation-ghost-trace-001",
};

export const mockData = {
  summary: mockInvestigationSummary,
  agents: mockAgents,
  timeline: mockTimelineEvents,
  riskMetrics: mockRiskMetrics,
  architectureReport: mockArchitectureReport,
  finalVerdict: mockFinalVerdict,
  predictedFailures: mockPredictedFailures,
  systemStatus: mockSystemStatus,
  investigationPhases: mockInvestigationPhases,
  analyzeResponse: mockAnalyzeResponse,
} as const;

export default mockData;
